import { useRouter } from 'next/router'
import { TextInput, Button, Title } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { z } from 'zod'

const ArtistSearchSchema = z.object({
  name: z.string().min(1, 'artist name is required'),
})

export default function HomePage() {
  const router = useRouter()

  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: zodResolver(ArtistSearchSchema),
  })

  return (
    <div className="mt-4 flex flex-col gap-4">
      <Title pb={4} order={2} size="h2" className="border-b">
        search for an artist
      </Title>
      <form
        className="space-y-3"
        onSubmit={form.onSubmit(({ name }) => {
          router.push(`/search?query=${name}`)
        })}
      >
        <TextInput
          placeholder="radiohead"
          label="artist name"
          withAsterisk
          {...form.getInputProps('name')}
        />
        <Button variant="default" type="submit">
          search
        </Button>
      </form>
    </div>
  )
}
