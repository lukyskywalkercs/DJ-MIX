
export class DeckEngine {
  public audioContext: AudioContext;
  public source: AudioBufferSourceNode | null = null;
  public buffer: AudioBuffer | null = null;
  
  // Nodes
  public gainNode: GainNode;
  public eqHigh: BiquadFilterNode;
  public eqMid: BiquadFilterNode;
  public eqLow: BiquadFilterNode;
  public filterNode: BiquadFilterNode;
  public analyser: AnalyserNode;
  
  // FX Nodes
  public driveNode: WaveShaperNode;
  public subBassNode: BiquadFilterNode;
  
  // State
  private startTime: number = 0;
  private pauseTime: number = 0;
  private isPlaying: boolean = false;
  private playbackRate: number = 1;

  constructor(context: AudioContext, destination: AudioNode) {
    this.audioContext = context;

    // Initialize Nodes
    this.gainNode = context.createGain();
    this.eqHigh = context.createBiquadFilter();
    this.eqMid = context.createBiquadFilter();
    this.eqLow = context.createBiquadFilter();
    this.filterNode = context.createBiquadFilter();
    this.analyser = context.createAnalyser();
    
    // Initialize FX Nodes
    this.driveNode = context.createWaveShaper();
    this.driveNode.curve = new Float32Array([0, 0]); // Neutral
    
    this.subBassNode = context.createBiquadFilter();
    this.subBassNode.type = 'lowshelf';
    this.subBassNode.frequency.value = 80; // Sub bass freq
    this.subBassNode.gain.value = 0;

    // Configure Nodes
    this.eqHigh.type = 'highshelf';
    this.eqHigh.frequency.value = 2500;
    
    this.eqMid.type = 'peaking';
    this.eqMid.frequency.value = 1000;
    this.eqMid.Q.value = 1;

    this.eqLow.type = 'lowshelf';
    this.eqLow.frequency.value = 320;

    this.filterNode.type = 'allpass'; // Start neutral
    this.filterNode.frequency.value = 20000;

    this.analyser.fftSize = 256;

    // Route: Source -> Drive -> SubBass -> EQ Low -> EQ Mid -> EQ High -> Filter -> Gain -> Analyser -> Destination
    // (Source is connected in play())
    this.driveNode.connect(this.subBassNode);
    this.subBassNode.connect(this.eqLow);
    this.eqLow.connect(this.eqMid);
    this.eqMid.connect(this.eqHigh);
    this.eqHigh.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(destination);
  }

  async loadFile(file: File): Promise<number> {
    const arrayBuffer = await file.arrayBuffer();
    this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
    return this.buffer.duration;
  }

  async loadUrl(url: string): Promise<number> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
    return this.buffer.duration;
  }

  play() {
    if (this.isPlaying || !this.buffer) return;

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.playbackRate.value = this.playbackRate;
    
    // Connect source to start of chain (Drive Node)
    this.source.connect(this.driveNode);

    this.startTime = this.audioContext.currentTime - this.pauseTime;
    this.source.start(0, this.pauseTime);
    this.isPlaying = true;
  }

  pause() {
    if (!this.isPlaying || !this.source) return;

    this.source.stop();
    this.pauseTime = this.audioContext.currentTime - this.startTime;
    this.isPlaying = false;
    this.source = null;
  }

  seek(time: number) {
    if (!this.buffer) return;
    
    const wasPlaying = this.isPlaying;
    if (this.isPlaying) {
        this.pause();
    }
    
    this.pauseTime = time;
    
    if (wasPlaying) {
        this.play();
    }
  }

  setVolume(val: number) {
    this.gainNode.gain.setTargetAtTime(val, this.audioContext.currentTime, 0.01);
  }

  setRate(val: number) {
    this.playbackRate = val;
    if (this.source) {
      this.source.playbackRate.setTargetAtTime(val, this.audioContext.currentTime, 0.05);
    }
  }

  setEQ(type: 'high' | 'mid' | 'low', val: number) {
    // val is -10 to 10 typically
    const node = type === 'high' ? this.eqHigh : type === 'mid' ? this.eqMid : this.eqLow;
    node.gain.setTargetAtTime(val, this.audioContext.currentTime, 0.05);
  }

  setFilter(val: number) {
    // val is -100 (LPF) to 100 (HPF). 0 is Neutral.
    const now = this.audioContext.currentTime;
    
    if (val === 0) {
      this.filterNode.type = 'allpass';
    } else if (val > 0) {
      // High Pass
      this.filterNode.type = 'highpass';
      // Map 0-100 to 20Hz - 10000Hz
      const freq = 20 + (val / 100) * 8000; 
      this.filterNode.frequency.setTargetAtTime(freq, now, 0.1);
      this.filterNode.Q.value = 1;
    } else {
      // Low Pass
      this.filterNode.type = 'lowpass';
      // Map 0 to -100 to 20000Hz - 200Hz
      const freq = 20000 - (Math.abs(val) / 100) * 19500;
      this.filterNode.frequency.setTargetAtTime(freq, now, 0.1);
      this.filterNode.Q.value = 1;
    }
  }

  setDrive(amount: number) {
    // amount 0 to 10
    if (amount <= 0.1) {
        this.driveNode.curve = null;
        return;
    }
    const k = amount * 10; // Scaling intensity
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < n_samples; ++i ) {
      let x = i * 2 / n_samples - 1;
      // Sigmoid distortion
      curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }
    this.driveNode.curve = curve;
  }

  setSubBass(amount: number) {
      // amount 0 to 10
      // Boost 80Hz low shelf
      const gain = amount * 1.5; // Max 15dB boost
      this.subBassNode.gain.setTargetAtTime(gain, this.audioContext.currentTime, 0.1);
  }

  getByteFrequencyData(array: Uint8Array) {
    this.analyser.getByteFrequencyData(array);
  }
}

class AudioEngine {
  public context: AudioContext;
  public masterGain: GainNode;
  public deckA: DeckEngine;
  public deckB: DeckEngine;
  public crossfaderGainA: GainNode;
  public crossfaderGainB: GainNode;
  
  // Recording Destination
  public recordDestination: MediaStreamAudioDestinationNode;

  constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.context.createGain();
    
    // Create Recording Destination (Does not output to speakers, just holds stream)
    this.recordDestination = this.context.createMediaStreamDestination();

    // Connect Master to Speakers AND Recorder
    this.masterGain.connect(this.context.destination);
    this.masterGain.connect(this.recordDestination);

    // Crossfader Routing
    this.crossfaderGainA = this.context.createGain();
    this.crossfaderGainB = this.context.createGain();

    this.crossfaderGainA.connect(this.masterGain);
    this.crossfaderGainB.connect(this.masterGain);

    this.deckA = new DeckEngine(this.context, this.crossfaderGainA);
    this.deckB = new DeckEngine(this.context, this.crossfaderGainB);

    // Init state
    this.setCrossfader(0.5);
  }

  resume() {
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  setCrossfader(val: number) {
    // 0 = Deck A full, 1 = Deck B full.
    // Linear fade for simplicity (or equal power)
    const gainA = Math.cos(val * 0.5 * Math.PI);
    const gainB = Math.cos((1 - val) * 0.5 * Math.PI);

    this.crossfaderGainA.gain.setTargetAtTime(gainA, this.context.currentTime, 0.01);
    this.crossfaderGainB.gain.setTargetAtTime(gainB, this.context.currentTime, 0.01);
  }
  
  // Get the stream for the recorder
  getAudioStream(): MediaStream {
      return this.recordDestination.stream;
  }
}

export const engine = new AudioEngine();
