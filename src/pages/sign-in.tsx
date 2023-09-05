import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="mt-4 flex items-center justify-center">
      <SignIn />
    </div>
  )
}
