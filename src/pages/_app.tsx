import '~/styles/globals.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Link from 'next/link'

// Move this to a new file?
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex flex-col items-center font-sans`}>
      <header className="p-2 flex justify-center w-full bg-secondary">
        <Link className="text-lg" href="/">
          setlister
        </Link>
      </header>
      <main className="flex min-h-screen flex-col w-full max-w-3xl">
        {children}
      </main>
    </div>
  )
}

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </QueryClientProvider>
  )
}
