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
 * Optimized for low-latency GroupRide voice communication
 */
export class WalkieTalkie {
  private supabase: SupabaseClient;
  private groupRideId: string;
  private riderId: string;
  private peers: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private channel: any;

  // Optimized ICE servers for low latency
  private readonly iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Add your own TURN server here for production reliability
    // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
  ];

  constructor(private options: WalkieTalkieOptions) {
    this.supabase = options.supabase;
    this.groupRideId = options.groupRideId;
    this.riderId = options.riderId;
  }

  async start() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.channel = this.supabase.channel(`walkie-${this.groupRideId}`)
        .on('broadcast', { event: 'signal' }, ({ payload }) => {
          this.handleSignal(payload);
        })
        .subscribe();

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

      console.log('[WalkieTalkie] Started with optimized ICE');
    } catch (err) {
      this.options.onError?.(err as Error);
    }
  }

  private async createPeerConnection(targetRiderId: string, isInitiator: boolean) {
    const pc = new RTCPeerConnection({
      iceServers: this.iceServers,
      iceCandidatePoolSize: 10,           // Pre-gather candidates for faster connection
      iceTransportPolicy: 'all',          // Allow all candidate types
      bundlePolicy: 'max-bundle',         // Reduce ports used
      rtcpMuxPolicy: 'require'            // Multiplex RTP/RTCP
    });

    this.peers.set(targetRiderId, pc);

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    pc.ontrack = (event) => {
      if (event.streams[0]) {
        this.options.onRemoteAudio?.(event.streams[0], targetRiderId);
      }
    };

    // Trickle ICE - send candidates as soon as they are gathered
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(targetRiderId, 'ice-candidate', event.candidate);
      }
    };

    // Prefer IPv4 and host candidates first when possible
    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === 'complete') {
        console.log(`[WalkieTalkie] ICE gathering complete for ${targetRiderId}`);
      }
    };

    if (isInitiator) {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        voiceActivityDetection: true
      });
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
    } else if (type === 'ice-candidate' && signalData) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(signalData));
      } catch (e) {
        console.warn('Failed to add ICE candidate', e);
      }
    }
  }

  private sendSignal(to: string, type: string, data: any) {
    this.supabase.channel(`walkie-${this.groupRideId}`).send({
      type: 'broadcast',
      event: 'signal',
      payload: { from: this.riderId, to, type, data }
    });

    // Backup via Edge Function
    this.supabase.functions.invoke('walkie-talkie', {
      body: {
        action: 'signal',
        data: { toRiderId: to, type, payload: data, groupRideId: this.groupRideId }
      }
    });
  }

  startTransmitting() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => (track.enabled = true));
    }
  }

  stopTransmitting() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => (track.enabled = false));
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