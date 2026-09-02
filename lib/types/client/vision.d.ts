/**
 * Vision-capability predicate for the screenshot button.
 *
 * Pure function over the session's model directory snapshot: the button is
 * shown only when the effective current model's catalog entry advertises
 * image input. Static and side-effect free so it is trivially unit-testable.
 */
import type { ModelDirectoryState } from '@deepseek-ai/dsh-client-ui-model-selection/client';
/** Whether the directory's effective current model accepts image input. */
export declare function modelSupportsImage(state: ModelDirectoryState): boolean;
//# sourceMappingURL=vision.d.ts.map