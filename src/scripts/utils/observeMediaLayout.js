// Refresh layout as media settles, rather than relying on a fixed load delay.
export default function observeMediaLayout(wrapper, refresh) {
    let frame = null
    let disposed = false
    const schedule = () => {
        if (disposed || frame !== null) return
        frame = requestAnimationFrame(() => {
            frame = null
            if (!disposed && wrapper.isConnected) refresh()
        })
    }
    const media = Array.from(wrapper.querySelectorAll('img, video'))
    const events = ['load', 'error', 'loadedmetadata']
    media.forEach(element => events.forEach(event => element.addEventListener(event, schedule)))
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    observer?.observe(wrapper)
    media.forEach(element => observer?.observe(element))
    schedule()

    return () => {
        disposed = true
        if (frame !== null) cancelAnimationFrame(frame)
        observer?.disconnect()
        media.forEach(element => events.forEach(event => element.removeEventListener(event, schedule)))
    }
}
