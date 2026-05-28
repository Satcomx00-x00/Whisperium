import type { Result } from './result';

export type TranscribeInput = {
  audio: Blob;
  language?: string;
  prompt?: string;
  signal?: AbortSignal;
};

export type TranscribeResult = {
  text: string;
  durationMs: number;
  model: string;
};

export type SttError =
  | { kind: 'network' }
  | { kind: 'auth' }
  | { kind: 'rate-limit'; retryAfterMs?: number }
  | { kind: 'server'; status: number; body?: string }
  | { kind: 'aborted' };

export interface SttProvider {
  readonly id: 'local' | 'cloud';
  transcribe(input: TranscribeInput): Promise<Result<TranscribeResult, SttError>>;
}

export interface HealthCheckable {
  healthCheck(): Promise<boolean>;
}
