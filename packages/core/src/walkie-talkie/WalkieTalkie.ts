import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface WalkieTalkieOptions {
  supabase: SupabaseClient;
  groupRideId: string;
  riderId: string;
  onRemoteAudio?: (stream: MediaStream, fromRiderId: string) => void;
  onError?: (error: Error) => void;
  onConnectionStateChange?: (peerId: string, state: RTCPeerConnectionState) => void;
}

/**
 * Peer-to-peer Walkie-talkie with robust ICE + STUN fallback support
 */
export class WalkieTalkie {
  private supabase: SupabaseClient;
  private groupRideId: string;
  private riderId: string;
  private peers: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private channel: any;
  private restartTimers: Map<string, number> = new Map();

  // Diverse STUN servers for better fallback and resilience
  private readonly iceServers = [
    // Google STUN (primary)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },

    // Cloudflare STUN (good global coverage)
    { urls: 'stun:stun.cloudflare.com:3478' },

    // Twilio / other public STUN (additional fallbacks)
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:stun.stunprotocol.org:3478' },

    // Add your own TURN server(s) here for production
    // {
    //   urls: 'turn:your-turn.example.com:3478',
    //   username: 'username',
    //   credential: 'credential'
    // },
    // {
    //   urls: 'turns:your-turn.example.com:5349',
    //   username: 'username',
    //   credential: 'credential'
    // }
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

      console.log('[WalkieTalkie] Started with STUN fallbacks');
    } catch (err) {
      this.options.onError?.(err as Error);
    }
  }

  private async createPeerConnection(targetRiderId: string, isInitiator: boolean) {
    const pc = new RTCPeerConnection({
      iceServers: this.iceServers,
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });

    this.peers.set(targetRiderId, pc);

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => pc.addTrack(track, this.localStream!));
    }

    pc.ontrack = (event) => {
      if (event.streams[0]) {
        this.options.onRemoteAudio?.(event.streams[0], targetRiderId);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(targetRiderId, 'ice-candidate', event.candidate);
      }
    };

    pc.oniceconnectionstatechange = () => {
      this.options.onConnectionStateChange?.(targetRiderId, pc.iceConnectionState);

      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        this.scheduleIceRestart(targetRiderId);
      }

      if (pc.iceConnectionState === 'connected') {
        this.clearRestartTimer(targetRiderId);
      }
    };

    if (isInitiator) {
      const offer = await pc.createOffer({ offerToReceiveAudio: true, voiceActivityDetection: true });
      await pc.setLocalDescription(offer);
      this.sendSignal(targetRiderId, 'offer', offer);
    }

    return pc;
  }

  private scheduleIceRestart(peerId: string) {
    this.clearRestartTimer(peerId);
    const timer = window.setTimeout(() => {
      const pc = this.peers.get(peerId);
      if (pc && (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected')) {
        this.restartIce(peerId);
      }
    }, 2000);
    this.restartTimers.set(peerId, timer);
  }

  private clearRestartTimer(peerId: string) {
    const timer = this.restartTimers.get(peerId);
    if (timer) {
      clearTimeout(timer);
      this.restartTimers.delete(peerId);
    }
  }

  private async restartIce(peerId: string) {
    const pc = this.peers.get(peerId);
    if (!pc) return;

    try {
      const offer = await pc.createOffer({ iceRestart: true, offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);
      this.sendSignal(peerId, 'offer', offer);
    } catch (err) {
      this.options.onError?.(err as Error);
    }
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
      } catch {}
    }
  }

  private sendSignal(to: string, type: string, data: any) {
    this.supabase.channel(`walkie-${this.groupRideId}`).send({
      type: 'broadcast',
      event: 'signal',
      payload: { from: this.riderId, to, type, data }
    });

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
    this.restartTimers.forEach(timer => clearTimeout(timer));
    this.restartTimers.clear();
    this.peers.forEach(pc => pc.close());
    this.peers.clear();
    if (this.channel) this.channel.unsubscribe();
    if (this.localStream) this.localStream.getTracks().forEach(track => track.stop());
  }
}