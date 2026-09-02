import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { DraftAttachmentId } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { ModelDirectoryState } from '@deepseek-ai/dsh-client-ui-model-selection/client';
import type { SnapshotStore } from '@deepseek-ai/dsh-client-store';
/** Per-session business face injected into the screenshot button. */
export interface ScreenshotInjected {
    /** The session's shared model directory store, for reactive vision gating. */
    directory: SnapshotStore<ModelDirectoryState>;
    /**
     * Register one captured PNG as a browser-owned draft image and return its
     * id, or `null` when the file is not an accepted image type.
     */
    createDraftImage: (file: File) => DraftAttachmentId | null;
    /** Release one registered draft image (e.g. after a refused admission). */
    releaseImage: (id: DraftAttachmentId) => void;
}
/** Full props of the screenshot button. */
export type ScreenshotButtonProps = PropsRuntime<'conversation.input.right'> & ScreenshotInjected & PropsLocale<'screenshot'>;
/**
 * The composer toolbar screenshot control.
 * @param props - injected face, standard session props, and the screenshot dictionary.
 */
export declare function ScreenshotButton({ directory, createDraftImage, releaseImage, inputActions, t, }: ScreenshotButtonProps): import("react").JSX.Element | null;
//# sourceMappingURL=ScreenshotButton.d.ts.map