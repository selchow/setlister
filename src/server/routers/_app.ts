import { createTRPCRouter } from '../trpc'
import { artistRouter } from './artist'
import { spotifyRouter } from './spotify'

export const appRouter = createTRPCRouter({
  artist: artistRouter,
  spotify: spotifyRouter,
})

export type AppRouter = typeof appRouter
