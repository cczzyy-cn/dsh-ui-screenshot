---
description: "DSH Web 输入框的截图按钮：截取屏幕并作为草稿图片插入，仅在当前模型支持图片输入时显示；面向截图体验的用户与维护者。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-screenshot

[English](README.md) | 中文

## Summary

本包为 DSH Web 输入框工具行添加一个截图按钮。点击后请求浏览器共享一个表面（整屏、某个窗口或某个标签页），捕获一帧已解码画面，并作为草稿图片插入输入框附件栏——与粘贴、拖拽走的同一条图片通道。仅当当前会话语义下的模型支持图片输入时才渲染该按钮，因此纯文本模型永远看不到该控件。它不改变任何模型可见的文案，也不持有服务器端状态。

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

与 `ui-conversation`、`ui-model-selection` 一起挂载。对于「有效模型支持图片输入」的会话，`conversation.input.right` 工具行、模型选择器之前会出现一个相机按钮。纯文本模型、未解析出模型、或目录外的模型都会渲染为空。

### 截图

点击按钮调用 `getDisplayMedia`；用户在浏览器共享对话框中选择一个表面。第一帧已解码画面被绘制到 canvas 并导出为 PNG，在 `conversation` 服务上注册为浏览器自有的草稿图片，再通过公开的 `inputActions.addImages` 路径追加，从而像粘贴或拖拽的图片一样出现在输入框附件栏。捕获流在取一帧后停止。

### 失败处理

若用户取消或运行时没有显示捕获能力，按钮不做任何事。若捕获文件被接入路径拒绝，则释放它，避免留下游离草稿。

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>实现内部 —— 点击展开</summary>

按钮是一个用 `ctx.slots.register` 注册的 `conversation.input.right` 条目。inject face 关闭 `conversation` 服务以注册草稿图片（`createDraftImages` / `releaseDraftImage`），并关闭 `modelDirectories` 服务以读取会话共享的模型目录。组件通过 `useSyncExternalStore` 读取目录 store，纯谓词 `modelSupportsImage` 依据有效当前模型的 `inputModalities` 决定可见性。它只通过 cordis 服务与其它插件协作——没有跨插件值导入。截图在 `capture.ts` 中完成：先等待 `play()` 再等待一帧已呈现（`requestVideoFrameCallback`，并带轮询与超时兜底），避免采到黑帧。

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

当截图表面不够时，可阅读以下页面。

- [ui-conversation](../ui-conversation/README.md) —— 声明 `conversation.input.right` 槽、草稿图片控制器与输入框。
- [ui-model-selection](../ui-model-selection/README.md) —— 拥有按钮所依赖的会话模型目录。
- [Client package map](../README.md) —— 相邻的浏览器 UI 包。

-----

<a id="why-this-package-collaborates-with-ui-conversation-and-ui-model-selection"></a>
## Why this package collaborates with ui-conversation and ui-model-selection

本插件是轻量 UI 附件，因此刻意把它的两项真正职责——插入图片、以及判断模型能否看图——委托给已经拥有它们的两包。它通过 cordis 服务来协作，而非导入另一插件的代码（客户端 bundle 禁止跨插件值导入，因此协作凭契约进行）。

### 插入图片 → `ui-conversation`（`conversation` 服务）

输入框及其附件栏由 `ui-conversation` 拥有。它的 `ConversationController`（`ctx.conversation`）是浏览器草稿图片注册表的唯一所有者：`createDraftImages` 分配 `ComposerAttachment`（id、预览 URL、尺寸），附件栏渲染与提交序列化都用它；`releaseDraftImage` 负责清理。在这里再造第二条图片接入路径，会分裂校验、预览生命周期与提交序列化逻辑，且两条路径可能对「哪些对象仍存活」得出不同结论。因此，按钮把捕获的 PNG 经由该注册表加上会话的 `inputActions.addImages` 提交，与粘贴、拖拽完全一致。

### 判断模型能否看图 → `ui-model-selection`（`modelDirectories` 服务）

`ui-model-selection` 的 `ModelDirectoryResolver`（`ctx.modelDirectories`）是唯一知道「有效当前模型及其 `inputModalities`」的地方：它把宿主代际目录（`session.modelCatalog`）与会话持久的 `modelSelection` 投影合并成一个响应式目录，`/model` 弹窗与输入框模型席位共享。输入框工具行槽位根本拿不到任何模型信息，而输入框又不得导入 `ui-model-selection`（依赖是单向的——`ui-model-selection → ui-conversation`，从不反向）。所以本插件读取同一个目录服务；若自建目录，会重复拉取目录与选择投影，并可能与模型席位在「当前是哪个模型」上不一致。

结果：输入框、模型席位与本按钮这两类关心都由单一事实来源承载。

-----

<a id="model-experience"></a>
## Model Experience

#### What the model sees

本插件本身不向模型上下文添加任何内容。用户截图会成为用户下一条消息中的图片部分，经由现有附件接入路径投递；模型将其视为普通用户图片内容。

#### Token effect

仅当携带截图的消息被提交时，才按提供商的图片计价规则计费图片 token。按钮及其文案不产生 token。

#### KV Cache effect

无。截图随新的用户消息进入；它不改变稳定的提示前缀，因此本身不会使 KV 缓存失效。接入该图片的消息会像任何消息一样延长历史尾部。

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

以下是当前包的约束。

- **仅浏览器捕获** —— 按钮依赖 `getDisplayMedia`；非浏览器运行时不可用，且需要安全上下文（localhost 属于安全上下文）。
- **无服务端门控** —— 按钮只是前瞻性的 UX 便利。对于纯文本模型，服务端仍会拒绝图片提示；按钮仅对目录中已知为文本的模型隐藏，不会在服务端复查。
- **依赖目录成员身份** —— 目录不再公布的模型（或手填的未列出 id）被视为非视觉，从而隐藏按钮。

<a id="dev-note"></a>
### Dev Note

<details>
<summary>维护者工作背景 —— 点击展开</summary>

无。

</details>
