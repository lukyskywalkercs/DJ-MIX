export interface DeckState {
  id: 'A' | 'B';
  trackName: string | null;
  isPlaying: boolean;
  volume: number;
  rate: number; // Pitch/Speed
  eqHigh: number;
  eqMid: number;
  eqLow: number;
  filter: number; // -100 (Low Pass) to 100 (High Pass)
  duration: number;
  currentTime: number;
}

export interface AudioEngineState {
  deckA: DeckState;
  deckB: DeckState;
  crossfader: number; // 0 (A) to 1 (B)
  masterVolume: number;
}

export type KnobType = 'volume' | 'eq' | 'filter' | 'rate';

export interface AIAdvice {
  transition: string;
  energy: string;
  technical: string;
}

export interface TrackSuggestion {
  artist: string;
  title: string;
  bpm: string;
  reason: string;
}

export interface SuggestionsResponse {
  detectedVibe: string;
  suggestions: TrackSuggestion[];
}