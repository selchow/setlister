import Link from 'next/link'
import { useRouter } from 'next/router'
import { Card, Title } from '@mantine/core'
import { trpc } from '~/utils/trpc'

export default function SearchPage() {
  const router = useRouter()
  const { query } = router.query

  const { data, isLoading, isError } = trpc.artist.search.useQuery(
    {
      slug: (query as string) ?? '',
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 2,
      cacheTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 60 * 24,
    },
  )

  return (
    <div className="mt-4 space-y-3">
      <Title pb={4} order={2} size="h2" className="border-b">
        results
      </Title>
      <p>you searched for: {query}</p>

      {isLoading && <p>loading...</p>}

      {isError && <p>sorry, something went wrong :(</p>}

      {data &&
        data.artist.map((artist) => (
          <Link
            className="block"
            href={`/artist/${artist.mbid}`}
            key={artist.mbid}
          >
            <Card withBorder>
              <h3>{artist.name}</h3>
            </Card>
          </Link>
        ))}
    </div>
  )
}
