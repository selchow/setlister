import type { RouterOutputs } from '~/utils/trpc'
import { useRouter } from 'next/router'
import { Fragment, useState } from 'react'
import {
  Accordion,
  Button,
  Title,
  Loader,
  Modal,
  TextInput,
  Checkbox,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm, zodResolver } from '@mantine/form'
import { useUser } from '@clerk/nextjs'
import { z } from 'zod'
import { trpc } from '~/utils/trpc'

type SetlistData = RouterOutputs['artist']['getSetlists'][0]

type CreatePlaylistModalProps = {
  opened: boolean
  close: () => void
  setlist: SetlistData
}

const CreatePlaylistSchema = z.object({
  name: z.string().min(1, 'playlist name is required'),
  description: z.string().default(''),
  isPublic: z.boolean().default(true),
})

const CreatePlaylistModal = ({
  opened,
  close,
  setlist,
}: CreatePlaylistModalProps) => {
  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      isPublic: true,
    },
    validate: zodResolver(CreatePlaylistSchema),
  })

  const { mutate, isLoading, isSuccess } =
    trpc.spotify.createPlaylist.useMutation()

  return (
    <Modal opened={opened} onClose={close} title="create playlist">
      <form
        className="space-y-2"
        onSubmit={form.onSubmit((values) => {
          mutate({
            sets: setlist.sets,
            artistName: setlist.artist.name,
            playlistName: values.name,
            playlistDescription: values.description,
            isPublic: values.isPublic,
          })
        })}
      >
        <TextInput
          placeholder="my cool playlist"
          label="name"
          withAsterisk
          {...form.getInputProps('name')}
        />

        <TextInput
          placeholder="full of good songs"
          label="description"
          {...form.getInputProps('description')}
        />

        <Checkbox
          mt="md"
          label="public"
          {...form.getInputProps('isPublic', { type: 'checkbox' })}
        />

        <Button
          mt={20}
          variant="default"
          type="submit"
          disabled={isLoading || isSuccess}
        >
          {isLoading
            ? 'loading...'
            : isSuccess
            ? 'playlist created!'
            : 'create playlist'}
        </Button>
      </form>
    </Modal>
  )
}

export default function ArtistPage() {
  const router = useRouter()
  const { mbid } = router.query
  const [opened, { open, close }] = useDisclosure()
  const { isSignedIn } = useUser()

  const [activeSetlist, setActiveSetlist] = useState<SetlistData | null>(null)

  const { data, isLoading, isRefetching, isError } =
    trpc.artist.getSetlists.useQuery(
      {
        mbid: (mbid as string) ?? '',
      },
      {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: 2,
        cacheTime: 1000 * 60 * 60 * 24,
        staleTime: 1000 * 60 * 60 * 24,
      },
    )

  // is there a better way to get artist info from the data?
  const artist = data && data[0].artist

  return (
    <div className="mt-4 grow flex flex-col gap-2">
      <Title pb={4} order={2} size="h2" className="border-b">
        {artist?.name}
      </Title>

      <h3 className="text-lg font-semibold">recent setlists</h3>

      {data ? (
        <Accordion variant="default">
          {data.map((setlist) => (
            <Accordion.Item key={setlist.id} value={setlist.id}>
              <Accordion.Control>
                {getDateString(setlist.date)} - {setlist.venue.name}
              </Accordion.Control>

              <Accordion.Panel>
                <div className="flex items-center justify-between py-4">
                  {/* TODO: UX when not logged in or not authorized */}
                  <Button
                    variant="default"
                    onClick={() => {
                      if (isSignedIn) {
                        setActiveSetlist(setlist)
                        open()
                      } else {
                        // TODO: display a toast
                      }
                    }}
                  >
                    create playlist
                  </Button>

                  <a className="" href={setlist.url}>
                    view on setlist.fm
                  </a>
                </div>

                {setlist.sets.map((set) => (
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
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : null}

      {activeSetlist ? (
        <CreatePlaylistModal
          setlist={activeSetlist}
          opened={opened}
          close={() => {
            close()
            setActiveSetlist(null)
          }}
        />
      ) : null}

      {(isLoading || isRefetching) && (
        <div className="flex justify-center">
          <Loader m={96} size={50} color="blue" />
        </div>
      )}

      {isError && <p>sorry, something went wrong :(</p>}
    </div>
  )
}

const getDateString = (date: string) => {
  const parts = date.split('-')
  return new Date(
    Number(parts[2]),
    Number(parts[1]),
    Number(parts[0]),
  ).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// function calculateSongInfo(
//   data: SetlistData | undefined,
//   lookbackCount: number,
// ) {
//   if (!data) {
//     return []
//   }

//   const setlists = data.setlist.slice(0, lookbackCount)

//   const songMap: Map<string, number> = new Map()

//   for (const setlist of setlists) {
//     // iterate through each "set" in a setlist. this can include the original set and any encores
//     for (const set of setlist.sets.set) {
//       for (const song of set.song) {
//         if (songMap.has(song.name)) {
//           songMap.set(song.name, (songMap.get(song.name) ?? 0) + 1)
//         } else {
//           songMap.set(song.name, 1)
//         }
//       }
//     }
//   }

//   const songList = [...songMap.entries()]
//     .map((entry) => {
//       const name = entry[0]
//       const count = entry[1]
//       const percentage = ((count / setlists.length) * 100).toFixed(0)
//       return {
//         name,
//         count,
//         percentage,
//       }
//     })
//     .sort((a, b) => b.count - a.count)

//   return songList
// }
