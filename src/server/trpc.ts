import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getAuth } from '@clerk/nextjs/server'
import { TRPCError, initTRPC } from '@trpc/server'

export const createTRPCContext = ({ req }: CreateNextContextOptions) => {
  const auth = getAuth(req)
  return {
    userId: auth.userId,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create()

export const createTRPCRouter = t.router

const isAuthed = t.middleware(async ({ ctx, next }) => {
  const { userId } = ctx

  if (!userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      userId,
    },
  })
})

export const procedure = t.procedure

export const authedProcedure = procedure.use(isAuthed)
