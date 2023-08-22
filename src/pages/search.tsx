import Link from 'next/link'
import { useRouter } from 'next/router'
import { SectionHeading } from '~/components/heading'
import { Card } from '~/components/ui/card'
import { trpc } from '~/utils/trpc'

export default function SearchPage() {
  const router = useRouter()
  const { query } = router.query

  const { data, isLoading, isError } = trpc.artist.search.useQuery(
    {
      slug: (query as string) ?? '',
    },
    {
      // 24 hours - this data won't ever change
      cacheTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 60 * 24,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  )

  return (
    <div className="mt-4 space-y-3">
      <SectionHeading>results </SectionHeading>
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
            <Card>
              <h3>{artist.name}</h3>
            </Card>
          </Link>
        ))}
    </div>
  )
}
