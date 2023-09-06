import { ClientEnvSchema, clientEnv } from './schemas.mjs'

export const env = ClientEnvSchema.parse(clientEnv)
