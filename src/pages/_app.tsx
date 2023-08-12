import '~/styles/globals.css'
import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const inter = Inter({ subsets: ['latin'] })

// Move this to a new file?
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex flex-col items-center ${inter.className}`}>
      <header className="p-4 w-full bg-gray-700">im a header</header>
      <main className="flex min-h-screen flex-col items-center max-w-3xl">
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
