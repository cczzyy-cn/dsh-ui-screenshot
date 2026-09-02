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
export declare function canCaptureScreen(): boolean;
/**
 * Capture one frame of the user-selected screen surface as a PNG File.
 * @returns the PNG file, or `null` when the user cancels, denies, or the
 *   runtime has no capture API.
 */
export declare function captureScreen(): Promise<File | null>;
//# sourceMappingURL=capture.d.ts.map