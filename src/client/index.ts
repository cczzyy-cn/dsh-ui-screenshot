/**
 * Screenshot composer button plugin, browser half. Registers the
 * `conversation.input.right` toolbar entry over the shared per-session model
 * directory (so it appears only when the active model accepts image input)
 * and over the Conversation draft-image controller (so a captured PNG becomes
 * a real draft image in the composer attachment rail).
 *
 * The button does not import ui-model-selection as a value — it collaborates
 * through the `modelDirectories` service and the `conversation` service, the
 * cordis-collaboration seam this repo requires across plugin boundaries.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
// Type-only: pulls the slot registry and the locale plugin's Context merge.
import type {} from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the Conversation service (ctx.conversation) and DraftAttachmentId.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the renderer's slot-registry service (ctx.slots).
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
// Type-only: pulls the model directory service (ctx.modelDirectories) and its types.
import type {} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type { DraftAttachmentId } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { ScreenshotButton, type ScreenshotInjected } from './ScreenshotButton.tsx'
import { en, zh, type ScreenshotKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The screenshot button's copy. */
    screenshot: ScreenshotKey
  }
}

/** The slice of the Conversation controller this plugin reaches through its service. */
interface DraftImageController {
  createDraftImages(files: readonly File[]): readonly { readonly id: DraftAttachmentId }[]
  releaseDraftImage(id: DraftAttachmentId): void
}

/** Dictionary namespace owned by this plugin. */
const NS = 'screenshot'

/** Required services: slots + locale, the model directory, and the Conversation face. */
export const inject = ['slots', 'locale', 'modelDirectories', 'conversation']

/**
 * Client plugin body: register the screenshot dictionary and the toolbar entry.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-screenshot: dictionaries')

  // The concrete Conversation controller is a superset of its IConversation
  // face; the extra draft-image verbs are reached through a local shape.
  const conversation = ctx.conversation as unknown as DraftImageController

  ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
    name: 'conversation.input.right',
    id: 'screenshot',
    order: 10,
    locale: NS,
    inject: (sessionId: SessionId): ScreenshotInjected => {
      // The session's shared model directory: reactive current model + catalog.
      // For addressed subagent sessions the directory resolves but its load
      // asserts availability; the reject here leaves the button hidden.
      const directory = ctx.modelDirectories.directoryFor(sessionId)
      void directory.load().catch(() => { /* surfaced on the directory store */ })
      return {
        directory: directory.store,
        createDraftImage: (file: File): DraftAttachmentId | null => {
          try {
            const [attachment] = conversation.createDraftImages([file])
            if (attachment === undefined) return null
            return attachment.id
          } catch {
            return null
          }
        },
        releaseImage: (id: DraftAttachmentId): void => conversation.releaseDraftImage(id),
      }
    },
  }, ScreenshotButton))
}
