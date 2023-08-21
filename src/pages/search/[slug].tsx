// Will be removed / replaced with tRPC
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'

// hook - move to new file later? (or tRPC)
const useArtistSearch = (slug: string) => {
  const query = useQuery({
    queryFn: async () => {
      console.log('fetching data')

      const url = '/api/search?' + new URLSearchParams({ artistName: slug })

      // opts?
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('something went wrong')
      }

      const data = await response.json()
      return data
    },

    queryKey: ['artist-search', slug],

    // 24 hours - this data won't ever change
    cacheTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60 * 24,

    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  return query
}

export default function SearchPage() {
  const router = useRouter()
  const { slug } = router.query

  const { data, isLoading } = useArtistSearch(slug as string)

  console.log(data)

  return (
    <div>
      <h2>results</h2>
      <p>you searched for: {slug}</p>

      {isLoading && <p>loading...</p>}

      {data && (
        <div>
          <p>{data.total} results</p>
          {data.artist.map((artist: Record<string, unknown>) => (
            <div key={artist.mbid}>
              <p>{artist.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
