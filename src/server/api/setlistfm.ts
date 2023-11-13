import { env } from '~/utils/env/server.mjs'
import mockSearchData from '~/data/artist-search.json'
import { ArtistSearchSchema } from '../schemas'

const SETLIST_FM_API_BASE_URL = 'https://api.setlist.fm/rest/1.0'

type SearchArtistsOptions = {
  slug: string
  page: number
}

export async function searchArtists(options: SearchArtistsOptions) {
  // limit API calls during development
  if (env.USE_MOCK_DATA) {
    const result = ArtistSearchSchema.parse(mockSearchData)
    return result.artist
  }

  const { slug, page } = options

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

  if (response.status === 404) {
    return []
  }

  if (!response.ok) {
    throw new Error('something went wrong :(')
  }

  const data = await response.json()
  const parsedData = ArtistSearchSchema.parse(data)
  return parsedData.artist
}
