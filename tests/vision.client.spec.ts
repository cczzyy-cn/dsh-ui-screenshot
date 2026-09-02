import { describe, expect, it } from 'vitest'
import type { ModelDirectoryState } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type { ModelSelection } from '@deepseek-ai/dsh-api-session-controller/types'
import { modelSupportsImage } from '../src/client/vision.ts'

/** Build a catalog-focused directory snapshot (extra fields defaulted, cast). */
function state(
  groups: ModelDirectoryState['groups'],
  current: ModelSelection | null,
): ModelDirectoryState {
  return {
    current,
    routable: current !== null,
    groups,
    failures: [],
    status: 'ready',
    error: null,
  } as ModelDirectoryState
}

const visionModel = {
  id: 'vision',
  name: 'Vision',
  inputModalities: ['text', 'image'] as const,
}
const textModel = {
  id: 'text',
  name: 'Text',
  inputModalities: ['text'] as const,
}

describe('modelSupportsImage', () => {
  it('is true when the current model advertises image input', () => {
    const groups = [{ id: 'deepseek-official', name: 'DeepSeek', models: [visionModel, textModel] }]
    expect(modelSupportsImage(state(groups, { provider: 'deepseek-official', model: 'vision' }))).toBe(true)
  })

  it('is false for a text-only model', () => {
    const groups = [{ id: 'deepseek-official', name: 'DeepSeek', models: [visionModel, textModel] }]
    expect(modelSupportsImage(state(groups, { provider: 'deepseek-official', model: 'text' }))).toBe(false)
  })

  it('is false with no current selection', () => {
    expect(modelSupportsImage(state([], null))).toBe(false)
  })

  it('is false when the current model is not in the catalog', () => {
    const groups = [{ id: 'deepseek-official', name: 'DeepSeek', models: [textModel] }]
    expect(modelSupportsImage(state(groups, { provider: 'other', model: 'ghost' }))).toBe(false)
  })

  it('is false when inputModalities is absent', () => {
    const groups = [{ id: 'p', name: 'P', models: [{ id: 'm', name: 'M' }] }]
    expect(modelSupportsImage(state(groups, { provider: 'p', model: 'm' }))).toBe(false)
  })

  it('matches on provider then model id', () => {
    const groups = [
      { id: 'a', name: 'A', models: [textModel] },
      { id: 'b', name: 'B', models: [visionModel] },
    ]
    // Same model id under another provider must not be the deciding route.
    expect(modelSupportsImage(state(groups, { provider: 'b', model: 'vision' }))).toBe(true)
    expect(modelSupportsImage(state(groups, { provider: 'a', model: 'vision' }))).toBe(false)
  })
})
