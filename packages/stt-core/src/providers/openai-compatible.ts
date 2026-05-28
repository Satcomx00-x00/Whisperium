import { z } from 'zod';
import { type Result, err, ok } from '../result';
import type { SttError, SttProvider, TranscribeInput, TranscribeResult } from '../types';

const ResponseSchema = z.object({ text: z.string() });

type Config = {
  baseURL: string;
  apiKey?: string;
  model: string;
};

export const createOpenAiCompatibleProvider = (
  id: 'local' | 'cloud',
  cfg: Config,
): SttProvider & { healthCheck(): Promise<boolean> } => ({
  id,

  async transcribe({
    audio,
    language,
    prompt,
    signal,
  }: TranscribeInput): Promise<Result<TranscribeResult, SttError>> {
    const form = new FormData();
    form.append('file', audio, 'audio.wav');
    form.append('model', cfg.model);
    if (language) form.append('language', language);
    if (prompt) form.append('prompt', prompt);

    const started = performance.now();

    try {
      const res = await fetch(`${cfg.baseURL}/v1/audio/transcriptions`, {
        method: 'POST',
        headers: cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : undefined,
        body: form,
        signal,
      });

      if (res.status === 401) return err({ kind: 'auth' });

      if (res.status === 429) {
        const ra = Number(res.headers.get('retry-after')) * 1000 || undefined;
        return err({ kind: 'rate-limit', retryAfterMs: ra });
      }

      if (!res.ok) {
        return err({ kind: 'server', status: res.status, body: await res.text() });
      }

      const parsed = ResponseSchema.parse(await res.json());
      return ok({
        text: parsed.text,
        durationMs: performance.now() - started,
        model: cfg.model,
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return err({ kind: 'aborted' });
      }
      return err({ kind: 'network' });
    }
  },

  async healthCheck() {
    try {
      const res = await fetch(`${cfg.baseURL}/v1/models`, {
        headers: cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : undefined,
      });
      return res.ok;
    } catch {
      return false;
    }
  },
});
