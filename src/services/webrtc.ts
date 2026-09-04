/**
 * WebRTC Audio/Video Connection & Mock Video Stream Generator
 */

export interface PeerStreamCallback {
  (peerId: string, stream: MediaStream): void;
}

export class WebRTCManager {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private onRemoteStreamCallbacks: Set<PeerStreamCallback> = new Set();
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mockCanvas: HTMLCanvasElement | null = null;
  private mockInterval: number | null = null;

  // ICE Server configuration
  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' },
    ],
  };

  public onRemoteStream(cb: PeerStreamCallback) {
    this.onRemoteStreamCallbacks.add(cb);
    return () => this.onRemoteStreamCallbacks.delete(cb);
  }

  // Get or create local camera/mic stream, or fallback to animated pixel mock stream
  public async getLocalStream(preferMock: boolean = false): Promise<MediaStream> {
    if (this.localStream) {
      return this.localStream;
    }

    if (!preferMock && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 480, frameRate: 24 },
          audio: true,
        });
        this.setupAudioAnalyser(this.localStream);
        return this.localStream;
      } catch (err) {
        console.warn('Webcam/Mic access denied or unavailable, generating aesthetic animated pixel stream fallback.', err);
      }
    }

    // Fallback: Generate cute animated canvas video stream
    this.localStream = this.createMockPixelAvatarStream();
    return this.localStream;
  }

  // Create an animated pixel avatar video stream from HTML5 Canvas
  public createMockPixelAvatarStream(avatarName: string = 'StudyBuddy'): MediaStream {
    if (this.mockInterval) clearInterval(this.mockInterval);

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    this.mockCanvas = canvas;

    let frame = 0;
    const drawMockFrame = () => {
      if (!ctx) return;
      frame++;
      const time = frame * 0.05;

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 320, 320);
      grad.addColorStop(0, '#fbcfe8');
      grad.addColorStop(1, '#c084fc');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 320, 320);

      // Grid scanlines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let y = 0; y < 320; y += 8) {
        ctx.fillRect(0, y, 320, 4);
      }

      // Cute animated floating head
      const bounce = Math.sin(time * 2) * 8;
      const headX = 160;
      const headY = 160 + bounce;

      // Character body
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(headX, headY + 70, 60, 0, Math.PI, true);
      ctx.fill();

      // Face
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(headX, headY, 50, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(headX, headY - 15, 52, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(headX - 52, headY - 15, 20, 40);
      ctx.fillRect(headX + 32, headY - 15, 20, 40);

      // Eyes (blinking)
      const isBlinking = frame % 60 < 6;
      ctx.fillStyle = '#1e1b4b';
      if (isBlinking) {
        ctx.fillRect(headX - 25, headY - 5, 16, 4);
        ctx.fillRect(headX + 9, headY - 5, 16, 4);
      } else {
        ctx.beginPath();
        ctx.arc(headX - 18, headY - 5, 8, 0, Math.PI * 2);
        ctx.arc(headX + 18, headY - 5, 8, 0, Math.PI * 2);
        ctx.fill();

        // Eye glints
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(headX - 16, headY - 7, 3, 0, Math.PI * 2);
        ctx.arc(headX + 20, headY - 7, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cheeks
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.arc(headX - 30, headY + 12, 8, 0, Math.PI * 2);
      ctx.arc(headX + 30, headY + 12, 8, 0, Math.PI * 2);
      ctx.fill();

      // Cute Smile
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(headX, headY + 10, 10, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      // Sparkles around head
      ctx.fillStyle = '#fef08a';
      const sparkX = headX + Math.cos(time) * 75;
      const sparkY = headY + Math.sin(time) * 45;
      ctx.fillRect(sparkX - 4, sparkY - 4, 8, 8);

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(avatarName, 160, 290);
    };

    this.mockInterval = window.setInterval(drawMockFrame, 1000 / 24);
    drawMockFrame();

    // Canvas stream with silent audio oscillator track
    const canvasStream = canvas.captureStream(24);

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const dst = audioCtx.createMediaStreamDestination();
      const gain = audioCtx.createGain();
      gain.gain.value = 0; // silent
      osc.connect(gain);
      gain.connect(dst);
      osc.start();

      dst.stream.getAudioTracks().forEach(track => canvasStream.addTrack(track));
    } catch {}

    return canvasStream;
  }

  private setupAudioAnalyser(stream: MediaStream) {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
    } catch {}
  }

  // Returns current microphone volume level (0-100)
  public getAudioVolume(): number {
    if (!this.analyser) return 0;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    const avg = sum / data.length;
    return Math.min(100, Math.round((avg / 128) * 100));
  }

  // Toggle Video track
  public toggleVideo(enabled?: boolean): boolean {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = enabled !== undefined ? enabled : !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  // Toggle Audio track
  public toggleAudio(enabled?: boolean): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = enabled !== undefined ? enabled : !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  // Create PeerConnection for a remote peer
  public createPeerConnection(
    peerId: string,
    onIceCandidate: (candidate: RTCIceCandidate) => void
  ): RTCPeerConnection {
    const pc = new RTCPeerConnection(this.rtcConfig);

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate);
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.onRemoteStreamCallbacks.forEach((cb) => cb(peerId, event.streams[0]));
      }
    };

    this.peerConnections.set(peerId, pc);
    return pc;
  }

  public getPeerConnection(peerId: string): RTCPeerConnection | undefined {
    return this.peerConnections.get(peerId);
  }

  public removePeer(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
    }
  }

  public cleanup() {
    if (this.mockInterval) clearInterval(this.mockInterval);
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const webrtc = new WebRTCManager();
