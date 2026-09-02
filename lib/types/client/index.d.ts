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
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { type ScreenshotKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** The screenshot button's copy. */
        screenshot: ScreenshotKey;
    }
}
/** Required services: slots + locale, the model directory, and the Conversation face. */
export declare const inject: string[];
/**
 * Client plugin body: register the screenshot dictionary and the toolbar entry.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map