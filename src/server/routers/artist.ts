import { z } from 'zod'
import mockSetlistData from '~/data/setlist.json'
import { createTRPCRouter, procedure } from '../trpc'
import { ArtistSearchSchema, SetlistResponseSchema } from '../schemas'

const SETLIST_FM_API_BASE_URL = 'https://api.setlist.fm/rest/1.0'

export const artistRouter = createTRPCRouter({
  search: procedure
    .input(
      z.object({
        slug: z.string(),
        page: z.number().default(1),
      }),
    )
    .query(async ({ input }) => {
      const { slug, page } = input

      const url =
        SETLIST_FM_API_BASE_URL +
        '/search/artists?' +
        new URLSearchParams({
          artistName: slug,
          p: String(page),
          sort: 'relevance',
        })

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'x-api-key': process.env.SETLIST_FM_API_KEY ?? '',
        },
      })

      // TODO: error handling?
      if (!response.ok) {
        throw new Error('something went wrong :(')
      }

      const data = await response.json()
      const parsedData = ArtistSearchSchema.parse(data)
      return parsedData
    }),

  getSetlists: procedure
    .input(
      z.object({
        mbid: z.string(),
        page: z.number().default(1),
      }),
    )
    .query(async ({ input }) => {
      const { mbid, page } = input

      // limit API calls during development
      if (process.env.USE_MOCK_DATA === 'true') {
        const result = SetlistResponseSchema.parse(mockSetlistData)
        return result
      }

      const url =
        `${SETLIST_FM_API_BASE_URL}/artist/${mbid}/setlists?` +
        new URLSearchParams({
          page: String(page),
        })

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'x-api-key': process.env.SETLIST_FM_API_KEY ?? '',
        },
      })

      // TODO: error handling?
      if (!response.ok) {
        throw new Error('something went wrong :(')
      }

      const data = await response.json()
      const parsedData = SetlistResponseSchema.parse(data)
      return parsedData
    }),
})
