import { SignUp } from '@clerk/nextjs'

export default function RegisterPage() {
  return (
    <div className="mt-4 flex items-center justify-center">
      <SignUp />
    </div>
  )
}
