import * as trpcNext from '@trpc/server/adapters/next'
import { appRouter } from '~/server/routers/_app'
import { createTRPCContext } from '~/server/trpc'

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    // error logging for development
    process.env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(
            `tRPC failed on path ${path ?? '<no path>'} with message: ${
              error.message
            }`,
          )
        }
      : undefined,
})
