import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Button } from '@mantine/core'
import { trpc } from '~/utils/trpc'
import { env } from '~/utils/env/client.mjs'

export default function AuthorizePage() {
  const router = useRouter()
  const { code } = router.query

  // TODO: check metadata to see if the user is already setup

  // TODO: do something if the user isn't logged in

  const authUrl =
    'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      client_id: env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      redirect_uri: env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
      response_type: 'code',
      scope: 'playlist-modify-public playlist-modify-private',
      // TODO: figure out what state is for?
      // state: '34fFs29kd09',
    })

  const { mutate, isLoading, isSuccess, isError } =
    trpc.spotify.authorize.useMutation()

  useEffect(() => {
    if (typeof code === 'string') {
      mutate({ code })
    }
  }, [code, mutate])

  return (
    <div className="mt-4 flex flex-col items-center gap-4">
      {code ? (
        <>
          {isLoading && <p>Stand by, setting up your account...</p>}
          {isSuccess && (
            <p>
              Succcess! Your account is set up and ready to use our Spotify
              integration.
            </p>
          )}
          {isError && (
            <p>
              Something when wrong authorizing with Spotify. You can try again
              later.
            </p>
          )}
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold">
            To create playlists, you need to authorize this app with Spotify.
          </h2>
          <p className="text-center">
            Click the link below to get redirected to Spotify, where you can
            confirm authorization. This allows us to create public and private
            playlists.
          </p>
          <Button variant="default" component="a" href={authUrl}>
            Authorize
          </Button>
        </>
      )}
    </div>
  )
}
