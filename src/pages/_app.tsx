import '~/styles/globals.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import type { AppProps, AppType } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Link from 'next/link'
import { ClerkProvider, SignOutButton, useAuth } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { useState } from 'react'
import { trpc } from '~/utils/trpc'

function Layout({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth()

  return (
    <div className={`flex flex-col items-center font-sans`}>
      <header className="p-2 flex justify-center gap-5 w-full border-b">
        <Link href="/">home</Link>
        {isSignedIn ? (
          <>
            <Link href="/authorize">authorize with spotify</Link>
            <SignOutButton>sign out</SignOutButton>
          </>
        ) : (
          <>
            <Link href="/sign-in">sign in</Link>
            <Link href="/register">register</Link>
          </>
        )}
      </header>
      <main className="flex min-h-screen flex-col w-full p-2 md:p-0 md:max-w-3xl">
        {children}
      </main>
    </div>
  )
}

// const theme = createTheme({
//   /** Put your mantine theme override here */
// })

const App: AppType = ({ Component, pageProps }: AppProps) => {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ClerkProvider {...pageProps} appearance={{ baseTheme: dark }}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <MantineProvider defaultColorScheme="dark">
          <Notifications />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </MantineProvider>
      </QueryClientProvider>
    </ClerkProvider>
  )
}

export default trpc.withTRPC(App)
