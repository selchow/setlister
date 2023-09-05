import type { RouterOutputs } from '~/utils/trpc'
import { useRouter } from 'next/router'
import { Fragment } from 'react'
import { SectionHeading } from '~/components/heading'
import { Card, CardDescription } from '~/components/ui/card'
import { trpc } from '~/utils/trpc'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'

export default function ArtistPage() {
  const router = useRouter()
  const { mbid } = router.query

  const { data, isLoading, isError } = trpc.artist.getSetlists.useQuery(
    {
      mbid: (mbid as string) ?? '',
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 2,

      // 24 hours - this data rarely changes
      cacheTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 60 * 24,
    },
  )

  const {
    mutate,
    isLoading: isCreatingPlaylist,
    isSuccess,
  } = trpc.spotify.createPlaylist.useMutation()

  // is there a better way to get artist info from the data?
  const artist = data && data.setlist[0].artist

  // TODO: make this configurable
  const lookbackCount = 10

  const songList = calculateSongInfo(data, lookbackCount)

  return (
    <div className="mt-4 flex flex-col gap-2">
      <SectionHeading>{artist?.name}</SectionHeading>

      <Tabs defaultValue="setlists">
        <TabsList>
          <TabsTrigger value="setlists">setlists</TabsTrigger>
          <TabsTrigger value="stats">stats</TabsTrigger>
        </TabsList>

        <TabsContent value="setlists" className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">recent setlists</h3>

          <Accordion type="single" collapsible className="w-full">
            {data &&
              data.setlist.map((setlist) => (
                <AccordionItem value={setlist.id} key={setlist.id}>
                  <AccordionTrigger>
                    {/* TODO: format date better */}
                    {setlist.venue.name} - {setlist.eventDate}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <div className="flex items-center gap-4 justify-between p-2">
                      {/* TODO: UX when not logged in or not authorized */}
                      <Button
                        disabled={isCreatingPlaylist || isSuccess}
                        onClick={() => {
                          console.log('creating a new playlist')
                          mutate({
                            artistName: artist?.name ?? '',
                            sets: setlist.sets.set,
                          })
                        }}
                      >
                        {isCreatingPlaylist
                          ? 'Loading...'
                          : isSuccess
                          ? 'Playlist created!'
                          : 'Create playlist'}
                      </Button>

                      <a className="" href={setlist.url}>
                        view on setlist.fm
                      </a>
                    </div>

                    {setlist.sets.set.map((set) => (
                      // TODO: need to fix key issue here (there's no id)
                      <Fragment key={set.encore}>
                        {set.encore && <p className="py-2">Encore:</p>}
                        <ol className="space-y-1">
                          {set.song.map((song, index) => (
                            <li key={song.name}>
                              {index + 1}: {song.name}
                            </li>
                          ))}
                        </ol>
                      </Fragment>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="stats" className="flex flex-col gap-2">
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
        </TabsContent>
      </Tabs>

      {isLoading && <p>loading...</p>}

      {isError && <p>sorry, something went wrong :(</p>}
    </div>
  )
}

type SetlistData = RouterOutputs['artist']['getSetlists']

function calculateSongInfo(
  data: SetlistData | undefined,
  lookbackCount: number,
) {
  if (!data) {
    return []
  }

  const setlists = data.setlist.slice(0, lookbackCount)

  const songMap: Map<string, number> = new Map()

  for (const setlist of setlists) {
    // iterate through each "set" in a setlist. this can include the original set and any encores
    for (const set of setlist.sets.set) {
      for (const song of set.song) {
        if (songMap.has(song.name)) {
          songMap.set(song.name, (songMap.get(song.name) ?? 0) + 1)
        } else {
          songMap.set(song.name, 1)
        }
      }
    }
  }

  const songList = [...songMap.entries()]
    .map((entry) => {
      const name = entry[0]
      const count = entry[1]
      const percentage = ((count / setlists.length) * 100).toFixed(0)
      return {
        name,
        count,
        percentage,
      }
    })
    .sort((a, b) => b.count - a.count)

  return songList
}
