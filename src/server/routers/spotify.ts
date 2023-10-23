import type { SongSchema } from '../schemas'
import { z } from 'zod'
import { clerkClient } from '@clerk/nextjs'
import { authedProcedure, createTRPCRouter } from '../trpc'
import { SetSchema } from '../schemas'
import {
  addTracksToPlaylist,
  createPlaylist,
  getAccessToken,
  requestAccessToken,
  searchTracks,
} from '../api/spotify'

export const spotifyRouter = createTRPCRouter({
  authorize: authedProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { access_token, expires_in, refresh_token } =
        await requestAccessToken(input.code)

      await clerkClient.users.updateUserMetadata(ctx.userId, {
        publicMetadata: {
          isAccountSetup: true,
        },
        privateMetadata: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAtTimestampMs: Date.now() + expires_in * 1000,
        } satisfies UserPrivateMetadata,
      })
    }),

  createPlaylist: authedProcedure
    .input(
      z.object({
        artistName: z.string(),
        sets: z.array(SetSchema).min(1),
        // TODO: add playlist name, description, public/private
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { artistName, sets } = input

      const accessToken = await getAccessToken(ctx.userId)

      // combine songs from multiple sets into one array
      const songs: Song[] = []
      for (const set of sets) {
        songs.push(...set.song)
      }

      const tracks = await getTracksFromSpotify(accessToken, artistName, songs)

      const playlist = await createPlaylist({
        accessToken,
        playlistName: 'test',
        playlistDescription: 'something',
        isPublic: false,
      })

      const addTrackResult = await addTracksToPlaylist({
        accessToken,
        playlistId: playlist.id,
        trackUris: tracks.map((track) => track.uri),
      })

      return addTrackResult
    }),
})

type Song = z.infer<typeof SongSchema>

const getTracksFromSpotify = async (
  accessToken: string,
  artistName: string,
  songs: Song[],
) => {
  const result: Array<{ name: string; uri: string }> = []

  for (const { name } of songs) {
    const searchResult = await searchTracks({
      accessToken,
      artistName,
      trackName: name.replace("'", ''), // remove apostrophes, ran into issues with them
    })

    for (const song of searchResult) {
      // confirm artist and track name match
      if (
        !areStringsEqual(song.name, name) ||
        !song.artists.find((artist) => areStringsEqual(artist.name, artistName))
      ) {
        continue
      }

      // found a match - confirm we aren't adding the same song twice (e.g. live, album, single)
      if (result.find((song) => areStringsEqual(song.name, name))) {
        continue
      }

      result.push({ uri: song.uri, name })
    }
  }

  return result
}

const areStringsEqual = (a: string, b: string) => {
  // Identifying tracks is hard because of minor variations, so we do a case-insensitive
  //  compare, as well as checking if one string is a substring of the other
  return (
    a.toLowerCase().includes(b.toLowerCase()) ||
    b.toLowerCase().includes(a.toLowerCase()) ||
    a.localeCompare(b, undefined, { sensitivity: 'base' }) === 0
  )
}
