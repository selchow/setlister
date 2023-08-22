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

const SetlistSchema = z.object({
  artist: ArtistSchema,
  id: z.string(),
  url: z.string(),
  eventDate: z.string(),
  venue: z.object({
    url: z.string(),
    id: z.string(),
    name: z.string(),
    // city?
    // city: z.object({})
  }),

  sets: z.object({
    set: z.array(
      z.object({
        // name: z.string(),
        encore: z.number().optional(),
        song: z.array(
          z.object({
            name: z.string(),
          }),
        ),
      }),
    ),
  }),

  // tour: z.object({
  // name: z.string(),
  // }),

  // part of the response, but not needed probably
  // info: z.string(),
  // versionId: z.string(),
  // lastUpdated: z.string(),
})

export const SetlistResponseSchema = z.object({
  setlist: z.array(SetlistSchema),
  type: z.string(),
  itemsPerPage: z.number(),
  page: z.number(),
  total: z.number(),
  info: z.string().optional(),
})
