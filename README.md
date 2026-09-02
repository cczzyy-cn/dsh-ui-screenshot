---
description: "Screenshot button for the DSH Web composer: capture the screen and insert it as a draft image, shown only when the active model supports image input; for users and maintainers of the screenshot experience."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-screenshot

English | [中文](README.zh.md)

## Summary

This package adds a screenshot button to the DSH Web composer tool row. Clicking it asks the browser to share a surface (whole screen, a window, or a tab), captures one decoded frame, and inserts it as a draft image in the composer attachment rail — the same image path used by paste and drag-and-drop. The button is rendered only when the active session's model supports image input, so a text-only model never sees the control. It makes no model-visible prose change and owns no server state.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Why this package collaborates with ui-conversation and ui-model-selection](#why-this-package-collaborates-with-ui-conversation-and-ui-model-selection)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Mount this plugin alongside `ui-conversation` and `ui-model-selection`. A camera button then appears in the `conversation.input.right` tool row, immediately before the model selector, for any session whose effective model advertises image input. A session with a text-only model, no resolved model, or an unlisted model renders nothing.

### Capturing

Clicking the button calls `getDisplayMedia`; the user picks a surface in the browser's share dialog. The first decoded frame is drawn to a canvas and exported as a PNG, registered on the `conversation` service as a browser-owned draft image, and appended through the public `inputActions.addImages` path so it shows in the composer attachment rail exactly like a pasted or dropped image. The capture stream is stopped after one frame.

### Failure handling

If the user cancels or the runtime lacks display capture, the button does nothing. A captured file the admission path refuses is released so no orphan draft remains.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The button is a `conversation.input.right` entry registered with `ctx.slots.register`. The inject face closes over the `conversation` service for draft-image registration (`createDraftImages` / `releaseDraftImage`) and over the `modelDirectories` service for the session's shared model directory. The component reads the directory store through `useSyncExternalStore`, and a pure predicate (`modelSupportsImage`) decides visibility from the effective current model's `inputModalities`. It collaborates with other plugins only through cordis services — no cross-plugin value imports. The screenshot is captured in `capture.ts`, which waits for `play()` plus one presented frame (`requestVideoFrameCallback`, with a poll-and-timeout fallback) so the sample is not a black frame.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

Read these pages when the screenshot surface is not enough.

- [ui-conversation](../ui-conversation/README.md) — declares the `conversation.input.right` slot, the draft-image controller, and the composer.
- [ui-model-selection](../ui-model-selection/README.md) — owns the per-session model directory the button gates on.
- [Client package map](../README.md) — adjacent browser UI packages.

-----

<a id="why-this-package-collaborates-with-ui-conversation-and-ui-model-selection"></a>
## Why this package collaborates with ui-conversation and ui-model-selection

This plugin is a thin UI add-on, so it deliberately delegates its two real jobs — inserting the image, and knowing whether the model can see it — to the packages that already own them. It reaches them through cordis services, never by importing another plugin's code (client bundles forbid cross-plugin value imports, so collaboration is by contract).

### Inserting the image → `ui-conversation` (the `conversation` service)

The composer and its attachment rail are owned by `ui-conversation`. Its `ConversationController` (`ctx.conversation`) is the single owner of the browser draft-image registry: `createDraftImages` allocates the `ComposerAttachment` (id, preview URL, dimensions) that the rail renders and that submission serializes, and `releaseDraftImage` cleans it up. Re-implementing a second image-intake path here would fork the validation, preview-lifecycle, and submit-serialization logic, and the two paths could disagree about which objects are live. The button therefore routes the captured PNG through that one registry plus the session's `inputActions.addImages`, exactly as paste and drag-and-drop do.

### Knowing whether the model can see images → `ui-model-selection` (the `modelDirectories` service)

`ui-model-selection`'s `ModelDirectoryResolver` (`ctx.modelDirectories`) is the only place that knows the effective current model and its `inputModalities`: it merges the host-generation catalog (`session.modelCatalog`) with the session's durable `modelSelection` projection into one reactive directory that both the `/model` popup and the composer model seat share. A composer tool-row slot receives no model information at all, and the composer must not import `ui-model-selection` (the dependency is one-way — `ui-model-selection → ui-conversation`, never back). So this plugin reads that same directory service; loading its own catalog would double the fetch and the selection projection and could disagree with the model seat about which model is active.

The result is one source of truth for both concerns across the composer, the model seat, and this button.

-----

<a id="model-experience"></a>
## Model Experience

#### What the model sees

Nothing is added to the model context by this plugin itself. The screenshot the user takes becomes an image part of the user's next message, delivered through the existing attachment-admission path; the model sees it as ordinary user image content.

#### Token effect

Image tokens are billed per the provider's image accounting only when a message carrying the screenshot is submitted. The button and its own copy add no tokens.

#### KV Cache effect

None. The screenshot rides a new user message; it does not alter the stable prompt prefix, so it does not by itself invalidate the KV cache. A message that admits the image extends the history tail like any other message.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

These are the current package constraints.

- **Browser capture only** — the button relies on `getDisplayMedia`; it is unavailable in non-browser runtimes and requires a secure context (localhost is secure).
- **No server-side gating** — the button is a proactive UX affordance only. A server that rejects image prompts for a text-only model still rejects them; the button is hidden for a catalog-known text model but not re-validated on the server.
- **Catalog-membership dependent** — a model the catalog no longer advertises (or a hand-entered unlisted id) is treated as non-vision, hiding the button.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
