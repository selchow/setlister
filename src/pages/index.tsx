import { useRouter } from 'next/router'
import { useState } from 'react'
import { SectionHeading } from '~/components/heading'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

export default function HomePage() {
  const [searchValue, setSearchValue] = useState('')
  const router = useRouter()

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push(`/search?query=${searchValue}`)
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <SectionHeading>search for an artist</SectionHeading>
      <form className="space-y-3" onSubmit={onSubmit}>
        <Input
          onChange={(event) => setSearchValue(event.target.value)}
          value={searchValue}
          placeholder="artist name"
          required
          type="text"
        />
        <Button variant="outline" type="submit">
          search
        </Button>
      </form>
    </div>
  )
}
