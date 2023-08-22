import { createTRPCRouter } from '../trpc'
import { artistRouter } from './artist'

export const appRouter = createTRPCRouter({
  artist: artistRouter,
})

export type AppRouter = typeof appRouter
