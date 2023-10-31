import { z } from 'zod'

export const AuthUrlResponseSchema = z.object({
  authUrl: z.string(),
})
