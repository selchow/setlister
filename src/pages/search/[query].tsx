import type { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { Card, Title } from '@mantine/core'
import { searchArtists } from '~/server/api/setlistfm'

type Artists = Awaited<ReturnType<typeof searchArtists>>

export default function SearchPage({
  artists,
  query,
}: {
  artists: Artists
  query: string
}) {
  return (
    <div className="mt-4 space-y-3">
      <Title pb={4} order={2} size="h2" className="border-b">
        results
      </Title>
      <p>you searched for: {query}</p>

      {artists && artists.length === 0 && <p>no results found :(</p>}

      {artists &&
        artists.map((artist) => (
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

export const getStaticProps: GetStaticProps = async (ctx) => {
  const query = ctx.params?.query

  if (typeof query !== 'string') {
    throw new Error('query must be a string')
  }

  if (query.includes('err')) {
    if (Math.random() < 0.25) {
      throw new Error('testing error page, you idiot')
    }
  }

  const artists = await searchArtists({ slug: query, page: 1 })
  return {
    props: {
      query,
      artists,
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}
