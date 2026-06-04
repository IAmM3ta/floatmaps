import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface WalkieTalkieOptions {
  supabase: SupabaseClient;
  groupRideId: string;
  riderId: string;
  onRemoteAudio?: (stream: MediaStream, fromRiderId: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Peer-to-peer Walkie-talkie using WebRTC + Supabase Realtime signaling
 * Push-to-talk mesh for GroupRides
 */
export class WalkieTalkie {
  private supabase: SupabaseClient;
  private groupRideId: string;
  private riderId: string;
  private peers: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private channel: any;

  constructor(private options: WalkieTalkieOptions) {
    this.supabase = options.supabase;
    this.groupRideId = options.groupRideId;
    this.riderId = options.riderId;
  }

  async start() {
    try {
      // Get microphone access
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Subscribe to signaling channel
      this.channel = this.supabase.channel(`walkie-${this.groupRideId}`)
        .on('broadcast', { event: 'signal' }, ({ payload }) => {
          this.handleSignal(payload);
        })
        .subscribe();

      // Get current peers
      const { data } = await this.supabase.functions.invoke('walkie-talkie', {
        body: { action: 'get_peers', data: { groupRideId: this.groupRideId } }
      });

      if (data?.peers) {
        for (const peerId of data.peers) {
          if (peerId !== this.riderId) {
            await this.createPeerConnection(peerId, true);
          }
        }
      }

      console.log('[WalkieTalkie] Started');
    } catch (err) {
      this.options.onError?.(err as Error);
    }
  }

  private async createPeerConnection(targetRiderId: string, isInitiator: boolean) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.peers.set(targetRiderId, pc);

    // Add local audio tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      if (event.streams[0]) {
        this.options.onRemoteAudio?.(event.streams[0], targetRiderId);
      }
    };

    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(targetRiderId, 'ice-candidate', event.candidate);
      }
    };

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.sendSignal(targetRiderId, 'offer', offer);
    }

    return pc;
  }

  private async handleSignal(payload: any) {
    const { from, type, data: signalData } = payload;

    let pc = this.peers.get(from);
    if (!pc) {
      pc = await this.createPeerConnection(from, false);
    }

    if (type === 'offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(signalData));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.sendSignal(from, 'answer', answer);
    } else if (type === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(signalData));
    } else if (type === 'ice-candidate') {
      await pc.addIceCandidate(new RTCIceCandidate(signalData));
    }
  }

  private sendSignal(to: string, type: string, data: any) {
    this.supabase.channel(`walkie-${this.groupRideId}`).send({
      type: 'broadcast',
      event: 'signal',
      payload: {
        from: this.riderId,
        to,
        type,
        data
      }
    });

    // Also call Edge Function as backup
    this.supabase.functions.invoke('walkie-talkie', {
      body: {
        action: 'signal',
        data: { toRiderId: to, type, payload: data, groupRideId: this.groupRideId }
      }
    });
  }

  // Push-to-talk: start transmitting
  startTransmitting() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => track.enabled = true);
    }
  }

  // Push-to-talk: stop transmitting
  stopTransmitting() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => track.enabled = false);
    }
  }

  disconnect() {
    this.peers.forEach(pc => pc.close());
    this.peers.clear();
    if (this.channel) this.channel.unsubscribe();
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
  }
}