import Link from 'next/link'
import { useRouter } from 'next/router'
import { Card, Title, Loader } from '@mantine/core'
import { trpc } from '~/utils/trpc'

export default function SearchPage() {
  const router = useRouter()
  const { query } = router.query

  const { data, isLoading, isError } = trpc.artist.search.useQuery(
    {
      slug: query as string,
    },
    {
      enabled: Boolean(query),
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

      {isLoading && (
        <div className="flex justify-center">
          <Loader m={96} size={50} color="blue" />
        </div>
      )}

      {isError && <p>sorry, something went wrong :(</p>}

      {data && data.length === 0 && <p>no results found :(</p>}

      {data &&
        data.map((artist) => (
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
