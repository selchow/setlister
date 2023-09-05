import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  // make all routes public
  publicRoutes: ['(.*)'],
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
