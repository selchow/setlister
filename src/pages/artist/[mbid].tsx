import { useRouter } from 'next/router'
import { useState } from 'react'
import { SectionHeading } from '~/components/heading'
import { Card, CardDescription } from '~/components/ui/card'
import { trpc } from '~/utils/trpc'

export default function ArtistPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lookbackCount, setLookbackCount] = useState(10)
  const router = useRouter()
  const { mbid } = router.query

  const { data, isLoading, isError } = trpc.artist.getSetlists.useQuery(
    {
      mbid: (mbid as string) ?? '',
    },
    {
      retry: false,
      // 24 hours - this data won't ever change
      cacheTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 60 * 24,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  )

  // is there a better way to get artist info from the data?
  const artist = data && data.setlist[0].artist

  const setlists = data?.setlist.slice(0, lookbackCount) ?? []

  // move this logic somewhere else?

  const songMap: Map<string, number> = new Map()

  for (const setlist of setlists ?? []) {
    // iterate through each "set" in a setlist. this can include the original set and any encores
    for (const set of setlist.sets.set) {
      // iterate through each song for this setlists set
      for (const song of set.song) {
        if (songMap.has(song.name)) {
          // if the song is already in the map, increment the count
          songMap.set(song.name, (songMap.get(song.name) ?? 0) + 1)
        } else {
          // otherwise, initialize the count to 1
          songMap.set(song.name, 1)
        }
      }
    }
  }

  const songList = [...songMap.entries()]
    .map((entry) => {
      // double check this logic (dividing by setlists.length)
      const percentage = ((entry[1] / setlists.length) * 100).toFixed(0)
      return {
        name: entry[0],
        count: entry[1],
        percentage,
      }
    })
    .sort((a, b) => b.count - a.count)

  return (
    <div className="mt-4 flex flex-col gap-2">
      <SectionHeading>{artist?.name}</SectionHeading>

      <h3 className="text-lg font-semibold">
        stats: last {lookbackCount} setlists
      </h3>

      {songList.map((entry) => {
        return (
          <Card key={entry.name} className="p-2">
            <h4 className="font-semibold">{entry.name}</h4>
            <CardDescription>
              played {entry.count} times ({entry.percentage}% of shows)
            </CardDescription>
          </Card>
        )
      })}

      {/* not sure if I need this info right now */}

      {/* <h3 className="text-lg font-semibold">setlists</h3> */}

      {/* {data &&
        data.setlist.map((setlist) => (
          <div key={setlist.id}>
            <p>
              {setlist.venue.name} - {setlist.eventDate}
            </p>
          </div>
        ))} */}

      {isLoading && <p>loading...</p>}

      {isError && <p>sorry, something went wrong :(</p>}
    </div>
  )
}
