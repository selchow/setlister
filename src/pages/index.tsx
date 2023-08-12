import { useRouter } from 'next/router'
import { useState } from 'react'

export default function HomePage() {
  const [searchValue, setSearchValue] = useState('')
  const router = useRouter()

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    router.push(`/search/${searchValue}`)
    console.log('val:', searchValue)
  }

  return (
    <div>
      <h2>search for an artist</h2>
      <form onSubmit={onSubmit}>
        <input
          className="text-black"
          onChange={(event) => setSearchValue(event.target.value)}
          value={searchValue}
          type="text"
        />
        <button type="submit">search</button>
      </form>
    </div>
  )
}
