import { z } from 'zod'

export const ClientEnvSchema = z.object({
  NEXT_PUBLIC_SPOTIFY_CLIENT_ID: z.string(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  NEXT_PUBLIC_SPOTIFY_REDIRECT_URI: z.string().url(),
})

export const ServerEnvSchema = ClientEnvSchema.extend({
  USE_MOCK_DATA: z.coerce.boolean().default(false),
  SETLIST_FM_API_KEY: z.string(),
  SPOTIFY_CLIENT_SECRET: z.string(),
  CLERK_SECRET_KEY: z.string(),
})

export const clientEnv = {
  NEXT_PUBLIC_SPOTIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SPOTIFY_REDIRECT_URI:
    process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
}
