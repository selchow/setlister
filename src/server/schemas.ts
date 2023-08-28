import { z } from 'zod'

const ArtistSchema = z.object({
  mbid: z.string(),
  name: z.string(),
  sortName: z.string(),
  disambiguation: z.string().optional(),
  url: z.string(),
})

export const ArtistSearchSchema = z.object({
  artist: z.array(ArtistSchema),
  type: z.string(),
  itemsPerPage: z.number(),
  page: z.number(),
  total: z.number(),
})

export const SongSchema = z.object({
  name: z.string(),
})

export const SetSchema = z.object({
  encore: z.number().optional(),
  song: z.array(SongSchema),
})

const SetlistSchema = z.object({
  artist: ArtistSchema,
  id: z.string(),
  url: z.string(),
  eventDate: z.string(),
  venue: z.object({
    url: z.string(),
    id: z.string(),
    name: z.string(),
    city: z.object({
      name: z.string(),
      state: z.string(),
    }),
  }),
  sets: z.object({
    set: z.array(SetSchema),
  }),
})

export const SetlistResponseSchema = z.object({
  setlist: z.array(SetlistSchema),
  type: z.string(),
  itemsPerPage: z.number(),
  page: z.number(),
  total: z.number(),
  info: z.string().optional(),
})
