const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

test('late media updates layout and navigation cancels stale work', async () => {
    const source = fs.readFileSync(path.join(__dirname, '../src/scripts/utils/observeMediaLayout.js'), 'utf8')
    const { default: observe } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
    const previous = [global.requestAnimationFrame, global.cancelAnimationFrame, global.ResizeObserver]
    const frames = new Map()
    let nextFrame = 0
    let resize
    let disconnected = false
    global.requestAnimationFrame = callback => { frames.set(++nextFrame, callback); return nextFrame }
    global.cancelAnimationFrame = id => frames.delete(id)
    global.ResizeObserver = class {
        constructor(callback) { resize = callback }
        observe() {}
        disconnect() { disconnected = true }
    }
    const flush = () => {
        const callbacks = [...frames.values()]
        frames.clear()
        callbacks.forEach(callback => callback())
    }
    const image = new EventTarget()
    const video = new EventTarget()
    const wrapper = { isConnected: true, querySelectorAll: () => [image, video] }
    let height = 0
    const measured = []
    let stop
    try {
        stop = observe(wrapper, () => measured.push(height))
        flush()
        assert.deepEqual(measured, [0])
        // The first navigation may finish long before the image download does.
        for (let i = 0; i < 120; i++) flush()
        height = 720
        image.dispatchEvent(new Event('load'))
        resize()
        flush()
        assert.deepEqual(measured, [0, 720], 'load and resize coalesce into a fresh measurement')
        height = 1080
        video.dispatchEvent(new Event('loadedmetadata'))
        flush()
        assert.equal(measured.at(-1), 1080)
        image.dispatchEvent(new Event('error'))
        flush()
        assert.equal(measured.length, 4, 'failed downloads also settle layout')
        resize()
        stop()
        flush()
        image.dispatchEvent(new Event('load'))
        resize()
        flush()
        assert.equal(measured.length, 4, 'leaving a case cancels queued and future callbacks')
        assert(disconnected)
        wrapper.isConnected = false
        stop = observe(wrapper, () => { throw new Error('Detached page was measured') })
        flush()
    } finally {
        stop?.()
        ;[global.requestAnimationFrame, global.cancelAnimationFrame, global.ResizeObserver] = previous
    }
})
