window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-screenshot",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/capture.ts
		/**
		* Browser screen capture for the composer screenshot button.
		*
		* `getDisplayMedia` prompts the user to pick a window, tab, or the whole
		* screen. The captured track is bound to a `<video>` and the first *decoded
		* frame* is drawn to a canvas and encoded as a PNG `File` that the composer
		* accepts as a draft image. Drawing before a frame is available yields a black
		* frame, so the capture waits for real playback (play + one presented frame)
		* before sampling. The stream is stopped in `finally` so the user-chosen
		* share surface is released as soon as one frame is taken.
		*/
		/** Whether this runtime can perform a display capture at all. */
		function canCaptureScreen() {
			return typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getDisplayMedia === "function" && typeof document !== "undefined" && typeof HTMLCanvasElement !== "undefined";
		}
		/**
		* Capture one frame of the user-selected screen surface as a PNG File.
		* @returns the PNG file, or `null` when the user cancels, denies, or the
		*   runtime has no capture API.
		*/
		async function captureScreen() {
			if (!canCaptureScreen()) return null;
			const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
			try {
				const video = document.createElement("video");
				video.muted = true;
				video.playsInline = true;
				video.srcObject = stream;
				await video.play().catch(() => {});
				await waitForFrame(video);
				const width = video.videoWidth;
				const height = video.videoHeight;
				if (width <= 0 || height <= 0) return null;
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				const context = canvas.getContext("2d");
				if (context === null) return null;
				context.drawImage(video, 0, 0, width, height);
				const blob = await new Promise((resolve) => {
					canvas.toBlob(resolve, "image/png");
				});
				if (blob === null) return null;
				return new File([blob], `screen-${Date.now()}.png`, { type: "image/png" });
			} finally {
				stream.getTracks().forEach((track) => {
					track.stop();
				});
			}
		}
		/**
		* Wait until the video has presented its first decoded frame.
		* @param video - the playing capture-surface video.
		*/
		async function waitForFrame(video) {
			const frame = new Promise((resolve) => {
				if (typeof video.requestVideoFrameCallback === "function") {
					video.requestVideoFrameCallback(() => {
						resolve();
					});
					return;
				}
				const poll = (attempt) => {
					if (video.videoWidth > 0 && video.videoHeight > 0) {
						requestAnimationFrame(() => requestAnimationFrame(() => {
							resolve();
						}));
						return;
					}
					if (attempt > 100) return;
					setTimeout(() => {
						poll(attempt + 1);
					}, 40);
				};
				poll(0);
			});
			await Promise.race([frame, new Promise((resolve) => {
				setTimeout(resolve, 1500);
			})]);
		}
		//#endregion
		//#region src/client/vision.ts
		/** Whether the directory's effective current model accepts image input. */
		function modelSupportsImage(state) {
			const current = state.current;
			if (current === null) return false;
			for (const group of state.groups) {
				if (group.id !== current.provider) continue;
				for (const model of group.models) {
					if (model.id !== current.model) continue;
					if (model.inputModalities?.includes("image") === true) return true;
					const signature = String(model.id + " " + (model.name || "")).toLowerCase();
					return /vision|visual/.test(signature);
				}
			}
			return false;
		}
		//#endregion
		//#region \0dsh-css:C:\Users\C\Desktop\git\deepseek-harness\packages\client\ui-screenshot\src\client\ScreenshotButton.module.css.mjs
		const css = ".odcW2a_button{width:28px;height:28px;color:var(--dsh-foreground-2,#000000a6);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:8px;justify-content:center;align-items:center;padding:0;transition:background-color .1s,color .1s;display:inline-flex}.odcW2a_button:hover{background:var(--dsh-surface-2,#0000000f);color:var(--dsh-foreground-1,#000000e6)}.odcW2a_button:focus-visible{outline:2px solid var(--dsh-accent,#3b82f6);outline-offset:1px}";
		const tagId = "@deepseek-ai/dsh-client-ui-screenshot/ScreenshotButton.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-screenshot";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ScreenshotButton_module_css_default = { "button": "odcW2a_button" };
		//#endregion
		//#region src/client/ScreenshotButton.tsx
		/**
		* Composer screenshot button. Sits in the `conversation.input.right` tool
		* row. Its visibility is gated on the active session's resolved model
		* supporting image input: nothing is rendered for a text-only model. Clicking
		* captures the screen through the browser's display-media API, registers the
		* captured PNG as a draft image on the Conversation controller, and appends
		* its id through the public `inputActions.addImages` path so it appears in the
		* composer attachment rail like any pasted/dropped image.
		*/
		/**
		* The composer toolbar screenshot control.
		* @param props - injected face, standard session props, and the screenshot dictionary.
		*/
		function ScreenshotButton({ directory, createDraftImage, releaseImage, inputActions, t }) {
			if (!modelSupportsImage((0, react.useSyncExternalStore)(directory.subscribe, directory.getSnapshot))) return null;
			const onCapture = async () => {
				const file = await captureScreen();
				if (file === null) return;
				const id = createDraftImage(file);
				if (id === null) return;
				if (!inputActions.addImages([id])) releaseImage(id);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: t("button.tooltip"),
				side: "top",
				delayMs: 500,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: ScreenshotButton_module_css_default.button,
					"aria-label": t("button.aria"),
					onMouseDown: (event) => {
						event.preventDefault();
					},
					onClick: () => {
						onCapture();
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 16 16",
						width: "16",
						height: "16",
						"aria-hidden": true,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							d: "M4 3h1.6l.8-1h3.2l.8 1H12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 1.5A.5.5 0 0 0 3.5 5v6a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V5a.5.5 0 0 0-.5-.5H4zm4 .5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z",
							fill: "currentColor"
						})
					})
				})
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** `screenshot` namespace dictionaries. */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"button.aria": "截图并插入到输入框",
			"button.tooltip": "截图",
			"capture.capturing": "请选择要截取的屏幕区域…",
			"capture.error": "截图失败，请重试。",
			"capture.unsupported": "当前浏览器不支持屏幕捕获。"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"button.aria": "Capture a screenshot and insert it into the input",
			"button.tooltip": "Screenshot",
			"capture.capturing": "Choose the screen area to capture…",
			"capture.error": "Capturing failed. Try again.",
			"capture.unsupported": "This browser does not support screen capture."
		};
		//#endregion
		//#region src/client/index.ts
		/** Dictionary namespace owned by this plugin. */
		const NS = "screenshot";
		/** Required services: slots + locale, the model directory, and the Conversation face. */
		const inject = [
			"slots",
			"locale",
			"modelDirectories",
			"conversation"
		];
		/**
		* Client plugin body: register the screenshot dictionary and the toolbar entry.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-screenshot: dictionaries");
			const conversation = ctx.conversation;
			ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
				name: "conversation.input.right",
				id: "screenshot",
				order: 10,
				locale: NS,
				inject: (sessionId) => {
					const directory = ctx.modelDirectories.directoryFor(sessionId);
					directory.load().catch(() => {});
					return {
						directory: directory.store,
						createDraftImage: (file) => {
							try {
								const [attachment] = conversation.createDraftImages([file]);
								if (attachment === void 0) return null;
								return attachment.id;
							} catch {
								return null;
							}
						},
						releaseImage: (id) => conversation.releaseDraftImage(id)
					};
				}
			}, ScreenshotButton));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map