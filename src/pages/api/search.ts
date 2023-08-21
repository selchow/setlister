import type { NextApiRequest, NextApiResponse } from 'next'

// will be replaced with tRPC
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Data = any

const SETLIST_FM_API_BASE_URL = 'https://api.setlist.fm/rest/1.0'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const artistName = req.query.artistName

  if (typeof artistName !== 'string') {
    res.status(400).json({ error: 'artistName is not a string' })
    return
  }

  const url =
    SETLIST_FM_API_BASE_URL +
    '/search/artists?' +
    new URLSearchParams({
      artistName,
      p: '1',
      sort: 'relevance',
    })

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'x-api-key': process.env.SETLIST_FM_API_KEY ?? '',
    },
  })

  const data = await response.json()

  res.status(200).json(data)
}
