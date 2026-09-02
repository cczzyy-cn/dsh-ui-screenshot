import { ScreenshotButton } from "./ScreenshotButton.js";
import { en, zh } from "./locales.js";
/** Dictionary namespace owned by this plugin. */
const NS = 'screenshot';
/** Required services: slots + locale, the model directory, and the Conversation face. */
export const inject = ['slots', 'locale', 'modelDirectories', 'conversation'];
/**
 * Client plugin body: register the screenshot dictionary and the toolbar entry.
 * @param ctx - client root context.
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-screenshot: dictionaries');
    // The concrete Conversation controller is a superset of its IConversation
    // face; the extra draft-image verbs are reached through a local shape.
    const conversation = ctx.conversation;
    ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
        name: 'conversation.input.right',
        id: 'screenshot',
        order: 10,
        locale: NS,
        inject: (sessionId) => {
            // The session's shared model directory: reactive current model + catalog.
            // For addressed subagent sessions the directory resolves but its load
            // asserts availability; the reject here leaves the button hidden.
            const directory = ctx.modelDirectories.directoryFor(sessionId);
            void directory.load().catch(() => { });
            return {
                directory: directory.store,
                createDraftImage: (file) => {
                    try {
                        const [attachment] = conversation.createDraftImages([file]);
                        if (attachment === undefined)
                            return null;
                        return attachment.id;
                    }
                    catch {
                        return null;
                    }
                },
                releaseImage: (id) => conversation.releaseDraftImage(id),
            };
        },
    }, ScreenshotButton));
}
//# sourceMappingURL=index.js.map