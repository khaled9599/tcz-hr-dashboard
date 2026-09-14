import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL) console.warn('DATABASE_URL is required to run migrations.')

export default defineConfig({
  dialect: 'mysql',
  schema: './server/db/schema.ts',
  out: './migrations',
  dbCredentials: { url: process.env.DATABASE_URL || 'mysql://placeholder:placeholder@127.0.0.1:3306/placeholder' },
  strict: true,
  verbose: true
})
