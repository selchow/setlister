import { ServerEnvSchema } from './schemas.mjs'

export const env = ServerEnvSchema.parse(process.env)
