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
export function canCaptureScreen(): boolean {
  return typeof navigator !== 'undefined'
    && typeof navigator.mediaDevices?.getDisplayMedia === 'function'
    && typeof document !== 'undefined'
    && typeof HTMLCanvasElement !== 'undefined'
}

/**
 * Capture one frame of the user-selected screen surface as a PNG File.
 * @returns the PNG file, or `null` when the user cancels, denies, or the
 *   runtime has no capture API.
 */
export async function captureScreen(): Promise<File | null> {
  if (!canCaptureScreen()) return null
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
  try {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.srcObject = stream
    // `play()` starts decoding frames; without it the canvas is black. The
    // picker grant is a user gesture, so an unmuted-required rejection is not
    // expected; catch it anyway so a stalled engine still yields a surface.
    await video.play().catch(() => { /* frame wait below still applies */ })
    await waitForFrame(video)
    const width = video.videoWidth
    const height = video.videoHeight
    if (width <= 0 || height <= 0) return null
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (context === null) return null
    context.drawImage(video, 0, 0, width, height)
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png')
    })
    if (blob === null) return null
    return new File([blob], `screen-${Date.now()}.png`, { type: 'image/png' })
  } finally {
    stream.getTracks().forEach((track) => { track.stop() })
  }
}

/**
 * Wait until the video has presented its first decoded frame.
 * @param video - the playing capture-surface video.
 */
async function waitForFrame(video: HTMLVideoElement): Promise<void> {
  // Prefer the one-shot frame-presented callback: it fires only once a real
  // frame is on screen, avoiding the black-frame sample. Race a timeout so a
  // stalled surface never hangs the capture.
  const frame = new Promise<void>((resolve) => {
    if (typeof video.requestVideoFrameCallback === 'function') {
      video.requestVideoFrameCallback(() => { resolve() })
      return
    }
    // Fallback: poll for real dimensions, then two animation frames.
    const poll = (attempt: number): void => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        requestAnimationFrame(() => requestAnimationFrame(() => { resolve() }))
        return
      }
      if (attempt > 100) return /* ~4s cap; the caller samples whatever is present */
      setTimeout(() => { poll(attempt + 1) }, 40)
    }
    poll(0)
  })
  await Promise.race([frame, new Promise<void>((resolve) => { setTimeout(resolve, 1500) })])
}
