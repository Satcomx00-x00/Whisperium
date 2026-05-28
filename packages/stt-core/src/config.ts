import { z } from 'zod';

export const ConfigSchema = z.object({
  shortcut: z.string().default('CmdOrCtrl+Shift+Space'),
  mode: z.enum(['auto', 'manual']).default('auto'),
  trailingSilenceMs: z.number().int().positive().default(1200),
  audio: z
    .object({
      deviceId: z.string().optional(),
      sampleRate: z.literal(16000),
    })
    .default({ sampleRate: 16000 }),
  vad: z
    .object({
      enabled: z.boolean().default(true),
      threshold: z.number().min(0).max(1).default(0.5),
    })
    .default({}),
  provider: z
    .object({
      active: z.enum(['local', 'cloud']).default('local'),
      local: z
        .object({ baseURL: z.string().url(), model: z.string() })
        .default({ baseURL: 'http://localhost:1234', model: 'whisper-1' }),
      cloud: z
        .object({ baseURL: z.string().url(), model: z.string() })
        .default({ baseURL: 'https://api.openai.com', model: 'whisper-1' }),
    })
    .default({}),
  output: z
    .object({
      mode: z.enum(['inject', 'clipboard', 'both']).default('inject'),
      trimTrailingSpace: z.boolean().default(false),
    })
    .default({}),
});

export type Config = z.infer<typeof ConfigSchema>;
