import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Button, Loader } from '@mantine/core'
import { useUser } from '@clerk/nextjs'
import { notifications } from '@mantine/notifications'
import { trpc } from '~/utils/trpc'
import { AuthUrlResponseSchema } from '~/utils/schemas'

export default function AuthorizePage() {
  const router = useRouter()
  const { code, state } = router.query

  const { user } = useUser()
  const isAccountSetup = user?.publicMetadata.isAccountSetup

  const { mutate, isLoading, isSuccess, isError } =
    trpc.spotify.authorize.useMutation()

  useEffect(() => {
    if (typeof code === 'string' && typeof state === 'string') {
      mutate({ code, state })
    }
  }, [code, state, mutate])

  const handleAuthorizeButtonClick = async () => {
    const response = await fetch('/api/authorize')
    const data = await response.json()
    const result = AuthUrlResponseSchema.safeParse(data)
    if (result.success) {
      window.location.href = result.data.authUrl
    } else {
      notifications.show({
        title: 'something went wrong :(',
        message: 'please try again later',
        color: 'red',
      })
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {code ? (
        <>
          {isLoading && (
            <p className="flex items-center gap-2">
              <Loader size={16} />
              Stand by, setting up your account...
            </p>
          )}
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
          <p>
            Click the link below to get redirected to Spotify, where you can
            confirm authorization. This allows us to create public and private
            playlists.
          </p>
          {isAccountSetup && (
            <p>
              Note: your account is already set up, but you can re-authorize for
              fun or if you run into any issues creating playlists.
            </p>
          )}
          <Button
            variant="default"
            className="place-self-stretch md:place-self-start"
            size="md"
            onClick={handleAuthorizeButtonClick}
          >
            Authorize
          </Button>
        </>
      )}
    </div>
  )
}
