import { useRouter } from 'next/router'
import { useState } from 'react'
import { TextInput, Button, Title } from '@mantine/core'

export default function HomePage() {
  const [searchValue, setSearchValue] = useState('')
  const router = useRouter()

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push(`/search?query=${searchValue}`)
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <Title pb={4} order={2} size="h2" className="border-b">
        search for an artist
      </Title>
      <form className="space-y-3" onSubmit={onSubmit}>
        <TextInput
          onChange={(event) => setSearchValue(event.target.value)}
          value={searchValue}
          placeholder="radiohead"
          label="artist name"
          required
          type="text"
        />
        <Button variant="default" type="submit">
          search
        </Button>
      </form>
    </div>
  )
}
