import { z } from 'zod'
import { clerkClient } from '@clerk/nextjs'
import { env } from '~/utils/env/server.mjs'

declare global {
  interface UserPublicMetadata {
    isAccountSetup: boolean
  }
  interface UserPrivateMetadata {
    accessToken: string
    refreshToken: string
    expiresAtTimestampMs: number
  }
}

const API_BASE_URL = 'https://api.spotify.com/v1'

// access token helpers

const RequestAccessTokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
})

export async function requestAccessToken(code: string) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
      ).toString('base64')}`,
    },
  })

  const data = await response.json()

  return RequestAccessTokenResponseSchema.parse(data)
}

const RefreshAccessTokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
})

export async function getAccessToken(userId: string) {
  const { privateMetadata } = await clerkClient.users.getUser(userId)

  if (Date.now() < Number(privateMetadata.expiresAtTimestampMs)) {
    console.log('Returning an unexpired access token')
    return privateMetadata.accessToken
  }

  console.log('Refreshing access token')

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: privateMetadata.refreshToken,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
      ).toString('base64')}`,
    },
  })

  const data = await response.json()

  const { access_token, expires_in } =
    RefreshAccessTokenResponseSchema.parse(data)

  void clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      accessToken: access_token,
      expiresAtTimestampMs: Date.now() + expires_in * 1000,
    } as UserPrivateMetadata,
  })

  return access_token
}

// base schemas

const BaseSpotifyObjectSchema = z.object({
  type: z.enum(['track', 'artist', 'album', 'playlist']),
  name: z.string(),
  id: z.string(),
  uri: z.string(),
})

const ArtistObjectSchema = BaseSpotifyObjectSchema.extend({
  type: z.literal('artist'),
})

const TracksObjectSchema = z.object({
  tracks: z.object({
    items: z.array(
      BaseSpotifyObjectSchema.extend({
        type: z.literal('track'),
        artists: z.array(ArtistObjectSchema),
      }),
    ),
  }),
})

const PlaylistObjectSchema = BaseSpotifyObjectSchema.merge(
  TracksObjectSchema,
).extend({
  type: z.literal('playlist'),
  public: z.boolean(),
})

const AddTracksResponseSchema = z.object({
  snapshot_id: z.string(),
})

// API helpers

type SearchTracksOptions = {
  accessToken: string
  trackName: string
  artistName: string
}

export async function searchTracks({
  accessToken,
  trackName,
  artistName,
}: SearchTracksOptions) {
  const url =
    `${API_BASE_URL}/search?` +
    new URLSearchParams({
      q: `artist:${artistName} track:${trackName}`,
      type: 'track',
    })

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await response.json()
  const parsedData = TracksObjectSchema.parse(data)
  return parsedData.tracks.items
}

type CreatePlaylistOptions = {
  accessToken: string
  playlistName: string
  playlistDescription?: string
  isPublic?: boolean
}

export async function createPlaylist({
  accessToken,
  playlistName,
  playlistDescription = '',
  isPublic = true,
}: CreatePlaylistOptions) {
  const response = await fetch(`${API_BASE_URL}/me/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name: playlistName,
      description: playlistDescription,
      public: isPublic,
    }),
  })

  const data = await response.json()

  return PlaylistObjectSchema.parse(data)
}

type AddTracksToPlaylistOptions = {
  accessToken: string
  playlistId: string
  trackUris: string[]
}

export async function addTracksToPlaylist({
  accessToken,
  playlistId,
  trackUris,
}: AddTracksToPlaylistOptions) {
  const response = await fetch(
    `${API_BASE_URL}/playlists/${playlistId}/tracks`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        uris: trackUris,
      }),
    },
  )

  const data = await response.json()

  return AddTracksResponseSchema.parse(data)
}
