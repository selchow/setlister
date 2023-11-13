import { z } from 'zod'
import mockSetlistData from '~/data/setlist.json'
import { env } from '~/utils/env/server.mjs'
import { createTRPCRouter, procedure } from '../trpc'
import { SetlistResponseSchema } from '../schemas'
import { searchArtists } from '../api/setlistfm'

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
  const transformedSetlists: TransformedSetlistResponse[] = []
  for (const setlist of response.setlist) {
    transformedSetlists.push({
      id: setlist.id,
      artist: setlist.artist,
      venue: setlist.venue,
      date: setlist.eventDate,
      sets: setlist.sets.set,
      url: setlist.url,
    })
  }
  return {
    setlists: transformedSetlists,
    totalPages: Math.ceil(response.total / response.itemsPerPage),
  }
}

export const artistRouter = createTRPCRouter({
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
          p: String(page),
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
