/**
 * Vision-capability predicate for the screenshot button.
 *
 * Pure function over the session's model directory snapshot: the button is
 * shown only when the effective current model's catalog entry advertises
 * image input. Static and side-effect free so it is trivially unit-testable.
 */
import type { ModelDirectoryState } from '@deepseek-ai/dsh-client-ui-model-selection/client'

/** Whether the directory's effective current model accepts image input. */
export function modelSupportsImage(state: ModelDirectoryState): boolean {
  const current = state.current
  if (current === null) return false
  for (const group of state.groups) {
    if (group.id !== current.provider) continue
    for (const model of group.models) {
      if (model.id !== current.model) continue
      if (model.inputModalities?.includes('image') === true) return true
      // Some harness versions do not expose inputModalities on the catalog
      // entry; fall back to the model id/name signaling vision support.
      const signature = `${model.id} ${model.name ?? ''}`.toLowerCase()
      return /vision|visual/.test(signature)
    }
  }
  return false
}
