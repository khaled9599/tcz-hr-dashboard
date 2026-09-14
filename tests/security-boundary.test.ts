import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('server authorization boundary', () => {
  it.each(['dashboard.get.ts', 'campaigns.get.ts', 'leads.get.ts', 'lead-analysis.get.ts', 'data-sources.get.ts'] as const)('%s requires authentication', (file) => {
    const source = readFileSync(resolve('server/api', file), 'utf8')
    expect(source).toContain('requireAuth(event)')
  })

  it('keeps Google credentials server-side', () => {
    const clientFiles = ['app/app.vue', 'app/pages/data-sources.vue'].map(file => readFileSync(resolve(file), 'utf8')).join('\n')
    expect(clientFiles).not.toContain('GOOGLE_PRIVATE_KEY')
    expect(clientFiles).not.toContain('DATABASE_URL')
  })
})
