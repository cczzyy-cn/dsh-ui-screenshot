import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Composer screenshot button. Sits in the `conversation.input.right` tool
 * row. Its visibility is gated on the active session's resolved model
 * supporting image input: nothing is rendered for a text-only model. Clicking
 * captures the screen through the browser's display-media API, registers the
 * captured PNG as a draft image on the Conversation controller, and appends
 * its id through the public `inputActions.addImages` path so it appears in the
 * composer attachment rail like any pasted/dropped image.
 */
import { useSyncExternalStore } from 'react';
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives';
import { captureScreen } from "./capture.js";
import { modelSupportsImage } from "./vision.js";
import css from './ScreenshotButton.module.css';
/**
 * The composer toolbar screenshot control.
 * @param props - injected face, standard session props, and the screenshot dictionary.
 */
export function ScreenshotButton({ directory, createDraftImage, releaseImage, inputActions, t, }) {
    const directoryState = useSyncExternalStore(directory.subscribe, directory.getSnapshot);
    const supported = modelSupportsImage(directoryState);
    if (!supported)
        return null;
    const onCapture = async () => {
        const file = await captureScreen();
        if (file === null)
            return;
        const id = createDraftImage(file);
        if (id === null)
            return;
        const admitted = inputActions.addImages([id]);
        if (!admitted)
            releaseImage(id);
    };
    return (_jsx(Tooltip, { label: t('button.tooltip'), side: "top", delayMs: 500, children: _jsx("button", { type: "button", className: css.button, "aria-label": t('button.aria'), onMouseDown: (event) => { event.preventDefault(); }, onClick: () => { void onCapture(); }, children: _jsx("svg", { viewBox: "0 0 16 16", width: "16", height: "16", "aria-hidden": true, children: _jsx("path", { d: "M4 3h1.6l.8-1h3.2l.8 1H12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 1.5A.5.5 0 0 0 3.5 5v6a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V5a.5.5 0 0 0-.5-.5H4zm4 .5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z", fill: "currentColor" }) }) }) }));
}
//# sourceMappingURL=ScreenshotButton.js.map