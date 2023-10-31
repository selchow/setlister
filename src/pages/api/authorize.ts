import type { NextApiRequest, NextApiResponse } from 'next'
import type { AuthUrlResponseSchema } from '~/utils/schemas'
import type { z } from 'zod'
import crypto from 'crypto'
import { env } from '~/utils/env/server.mjs'

type AuthUrlResponse = z.infer<typeof AuthUrlResponseSchema>

function generateStateValue() {
  return crypto.randomBytes(16).toString('hex')
}

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const state = generateStateValue()

  const authUrl =
    'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      client_id: env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      redirect_uri: env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
      response_type: 'code',
      scope: 'playlist-modify-public playlist-modify-private',
      state,
    })

  res
    .setHeader(
      'Set-Cookie',
      `state=${state}; HttpOnly; Path=/; Secure; SameSite=Strict`,
    )
    .status(200)
    .json({ authUrl } satisfies AuthUrlResponse)
}
