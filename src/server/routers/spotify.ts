import type { SongSchema } from '../schemas'
import { z } from 'zod'
import SpotifyWebApi from 'spotify-web-api-node'
import { clerkClient } from '@clerk/nextjs'
import { authedProcedure, createTRPCRouter } from '../trpc'
import { SetSchema } from '../schemas'

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
})

export const spotifyRouter = createTRPCRouter({
  authorize: authedProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await spotifyApi.authorizationCodeGrant(input.code)

      // write token info to Clerk's metadata
      await clerkClient.users.updateUserMetadata(ctx.userId, {
        publicMetadata: {
          isAccountSetup: true,
        },
        privateMetadata: {
          accessToken: result.body.access_token,
          refreshToken: result.body.refresh_token,
          expiresAtTimestampMs: Date.now() + result.body.expires_in * 1000,
        },
      })
    }),

  createPlaylist: authedProcedure
    .input(
      z.object({
        artistName: z.string(),
        sets: z.array(SetSchema).min(1),

        // TODO: playlist name, public/private, description
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { artistName, sets } = input

      // set up Spotify access token, refresh if needed
      const user = await clerkClient.users.getUser(ctx.userId)
      const { accessToken, refreshToken, expiresAtTimestampMs } =
        user.privateMetadata
      spotifyApi.setAccessToken(accessToken as string)
      spotifyApi.setRefreshToken(refreshToken as string)

      if (Date.now() > Number(expiresAtTimestampMs)) {
        spotifyApi.refreshAccessToken()
      }

      console.debug('refreshed access token')

      // combine songs from multiple sets into one array
      const songs = sets.reduce<Song[]>((acc, curr) => {
        acc.push(...curr.song)
        return acc
      }, [])

      console.debug('songs to add: ', songs)

      // fetch track URIs from Spotify
      const tracks = await getTracksFromSpotify(artistName, songs)

      console.debug('tracks to add: ', tracks)

      // create playlist (add description, public/private, etc. later)
      const playlist = await spotifyApi.createPlaylist('test playlist', {
        description: 'test description',
        public: true,
      })

      console.debug('create plstlist result: ', playlist)

      // add tracks to playlist
      const addTrackResult = await spotifyApi.addTracksToPlaylist(
        playlist.body.id,
        tracks.map((track) => track.uri),
      )

      return addTrackResult
    }),
})

// TODO: move types / schemas to different files

type Song = z.infer<typeof SongSchema>

type SongWithSpotifyData = {
  name: string
  artistName: string
  uri: string
}

const ArtistSchema = z.object({
  name: z.string(),
  uri: z.string(),
})

const ItemsSchema = z
  .object({
    artists: z.array(ArtistSchema).min(1),
    name: z.string(),
    id: z.string(),
    uri: z.string(),
  })
  .array()

const getTracksFromSpotify = async (artistName: string, songs: Song[]) => {
  const result: SongWithSpotifyData[] = []

  for (const { name } of songs) {
    const response = await spotifyApi.searchTracks(
      // remove apostrophes in track name, noticed some weird behavior with them
      `track:${name.replace("'", '')} artist:${artistName}`,
    )

    console.log('respy ', response)

    const parsedData = ItemsSchema.parse(response.body?.tracks?.items)

    for (const item of parsedData) {
      // check artist and track name to make sure it's the right song (songs can have multiple artists)
      if (
        !areStringsEqual(item.name, name) ||
        !item.artists.find((artist) => areStringsEqual(artist.name, artistName))
      ) {
        continue
      }

      // found a match - it's possible to have two songs with same name by same artist
      // (e.g. single vs album version) so confirm that we aren't adding the same song twice
      if (!result.find((song) => areStringsEqual(song.name, name))) {
        // TODO: just return uri, not whole object
        result.push({
          name,
          artistName,
          uri: item.uri,
        })
      }
    }
  }

  return result
}

const areStringsEqual = (a: string, b: string) => {
  // Identifying tracks is hard because of minor variations, so we do a locale compare
  // of equality, as well as checking if one string is a substring of the other
  return (
    a.toLowerCase().includes(b.toLowerCase()) ||
    b.toLowerCase().includes(a.toLowerCase()) ||
    a.localeCompare(b, undefined, { sensitivity: 'base' }) === 0
  )
}
