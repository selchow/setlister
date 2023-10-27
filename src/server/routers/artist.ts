import { z } from 'zod'
import mockSetlistData from '~/data/setlist.json'
import mockSearchData from '~/data/artist-search.json'
import { env } from '~/utils/env/server.mjs'
import { createTRPCRouter, procedure } from '../trpc'
import { ArtistSearchSchema, SetlistResponseSchema } from '../schemas'

const SETLIST_FM_API_BASE_URL = 'https://api.setlist.fm/rest/1.0'

type SetlistResponse = z.infer<typeof SetlistResponseSchema>

type TransformedSetlistResponse = {
  id: string
  artist: SetlistResponse['setlist'][0]['artist']
  venue: SetlistResponse['setlist'][0]['venue']
  date: string
  sets: SetlistResponse['setlist'][0]['sets']['set']
  url: string
}

function transformSetlistResponse(response: SetlistResponse) {
  const transformedResult: TransformedSetlistResponse[] = []
  for (const setlist of response.setlist) {
    transformedResult.push({
      id: setlist.id,
      artist: setlist.artist,
      venue: setlist.venue,
      date: setlist.eventDate,
      sets: setlist.sets.set,
      url: setlist.url,
    })
  }
  return transformedResult
}

export const artistRouter = createTRPCRouter({
  search: procedure
    .input(
      z.object({
        slug: z.string(),
        page: z.number().default(1),
      }),
    )
    .query(async ({ input }) => {
      // limit API calls during development
      if (env.USE_MOCK_DATA) {
        const result = ArtistSearchSchema.parse(mockSearchData)
        return result
      }

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
          'x-api-key': env.SETLIST_FM_API_KEY,
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
      if (env.USE_MOCK_DATA) {
        const result = SetlistResponseSchema.parse(mockSetlistData)
        return transformSetlistResponse(result)
      }

      const url =
        `${SETLIST_FM_API_BASE_URL}/artist/${mbid}/setlists?` +
        new URLSearchParams({
          page: String(page),
        })

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'x-api-key': env.SETLIST_FM_API_KEY,
        },
      })

      // TODO: error handling?
      if (!response.ok) {
        throw new Error('something went wrong :(')
      }

      const data = await response.json()
      const parsedData = SetlistResponseSchema.parse(data)
      return transformSetlistResponse(parsedData)
    }),
})
