import gsap from "gsap"
import { bind, each } from "lodash"
import About from "./pages/About"
import Case from "./pages/Case"
import Home from "./pages/Home"

import Navigation from "./components/Navigation"
import Preloader from "./components/Preloader"
import normalizeWheel from "normalize-wheel"
import Canvas from "./components/Canvas"
import device from "./classes/DeviceDetection"

class App {

    constructor() {

        this.createContent()

        this.createCanvas()
        this.createPages()
        this.createNavigation()
        this.createPreloader()

        this.addEventListeners()
        this.addLinkListeners()


        this.onResize()
        this.update()
    }



    createContent() {
        this.content = document.querySelector('.content')
        this.bodyContent = document.querySelector('body')
        this.template = this.content.getAttribute('data-template')
    }


    createCanvas() {
        this.canvas = new Canvas({ template: this.template })
    }

    createNavigation() {
        this.navigation = new Navigation()
    }

    createPreloader() {
        this.preloader = new Preloader({ template: this.template })

        this.preloader.once('completed', (cache) => {
            this.cache = cache || new Map()
            this.onPreloader()
        })
    }

    createPages() {
        this.pages = {
            "home": new Home({ canvas: this.canvas }),
            "about": new About(),
            "case": new Case(),
        }

        this.page = this.pages[this.template]

        this.page.create()
    }


    /**
     * Events.
     */


    onPreloader() {
        this.onResize()

        this.canvas.onPreloaded({ onPreloader: true })

        this.page.show({ onPreloader: true })

        this.prefetchNextCase()
    }

    // Pre-fetch the next case page so navigation is instant and colors are available
    prefetchNextCase() {
        if (this.template !== 'case' || !this.page?.nextHref) return
        const url = this.page.nextHref
        this.fetchPage(url).then(html => {
            if (!html || !this.page) return
            const div = document.createElement('div')
            div.innerHTML = html
            const c = div.querySelector('.content')
            const nextBg = c?.getAttribute('data-backgroundColor') || null
            const nextColor = c?.getAttribute('data-color') || null
            this.page.initColorTransition(nextBg, nextColor)
        })
    }

    async fetchPage(url) {
        if (this.cache && this.cache.has(url)) {
            return this.cache.get(url)
        }

        const response = await fetch(url)
        const html = await response.text()

        if (this.cache) {
            this.cache.set(url, html)
        }

        return html
    }


    async onChange({ url, transition = null }) {
        this.navigatingToNext = false

        this.canvas.onChangeStart(this.template)

        await this.page.hide()

        const html = await this.fetchPage(url)

        if (html) {

            window.history.pushState({}, '', url)

            const div = document.createElement('div')

            div.innerHTML = html

            const divContent = div.querySelector('.content')

            this.template = divContent.getAttribute('data-template')
            this.backgroundColor = divContent.getAttribute('data-backgroundColor')
            this.textColor = divContent.getAttribute('data-color')

            gsap.to(this.bodyContent, {
                backgroundColor: this.backgroundColor,
                color: this.textColor,
                duration: 0.9,
                ease: 'power2.inOut'
            })
            this.content.setAttribute('data-template', this.template)

            this.content.innerHTML = divContent.innerHTML

            // Case transition offsets must be set before canvas setup (hero banner is measured there)
            if (transition && this.template === 'case') {
                this.applyCaseTransitionOffsets(transition)
            }

            this.canvas.onChangeEnd(this.template, null, transition)

            this.page = this.pages[this.template]

            this.page.create()

            // Home offsets applied AFTER canvas.onChangeEnd so gallery is already scrolled
            // to the correct case slot — getBoundingClientRect then returns correct positions
            if (transition && this.template === 'home') {
                this.applyHomeTransitionOffsets(transition)
            }

            this.prefetchNextCase()

            setTimeout(() => {
                this.onResize()
            }, 1000)

            await this.page.show({ transition })

            this.createNavigation()

            this.addLinkListeners()

        }
    }

    applyHomeTransitionOffsets(transition) {
        const allWrappers = document.querySelectorAll('.case_gallery_link_wrapper')
        const wrapper = allWrappers[transition.mediaIndex]
        if (!wrapper) return

        const galleryHeading = wrapper.querySelector('.case_gallery_count_heading')
        const galleryName = wrapper.querySelector('.case_gallery_name')

        if (galleryHeading && transition.fromHeadingBounds) {
            const to = galleryHeading.getBoundingClientRect()
            gsap.set(galleryHeading, {
                x: transition.fromHeadingBounds.left - to.left,
                y: transition.fromHeadingBounds.top - to.top,
            })
        }

        if (galleryName && transition.fromNameBounds) {
            const to = galleryName.getBoundingClientRect()
            gsap.set(galleryName, {
                x: transition.fromNameBounds.left - to.left,
                y: transition.fromNameBounds.top - to.top,
            })
        }
    }

    applyCaseTransitionOffsets(transition) {
        const headingEl = document.querySelector('.case_count_heading')
        const nameEl = document.querySelector('.case_name')

        if (headingEl && transition.fromHeadingBounds) {
            const to = headingEl.getBoundingClientRect()
            gsap.set(headingEl, {
                x: transition.fromHeadingBounds.left - to.left,
                y: transition.fromHeadingBounds.top - to.top,
            })
        }

        if (nameEl && transition.fromNameBounds) {
            const to = nameEl.getBoundingClientRect()
            gsap.set(nameEl, {
                x: transition.fromNameBounds.left - to.left,
                y: transition.fromNameBounds.top - to.top,
            })
        }
    }


    onResize() {

        const wasTouch = device.isTouch
        device.update()

        if (wasTouch !== device.isTouch) {
            window.location.reload()
            return
        }

        if (this.page && this.page.onResize) (
            this.page.onResize()
        )


        window.requestAnimationFrame(_ => {
            if (this.canvas && this.canvas.onResize) {
                this.canvas.onResize()
            }
        })
    }


    onMouseDown(event) {
        if (this.canvas && this.canvas.onMouseDown) {
            this.canvas.onMouseDown(event)
        }

        if (this.page && this.page.onMouseDown) {
            this.page.onMouseDown(event)
        }
    }

    onMouseMove(event) {
        if (this.canvas && this.canvas.onMouseMove) {
            this.canvas.onMouseMove(event)
        }

        if (this.page && this.page.onMouseMove) {
            this.page.onMouseMove(event)
        }
    }

    onMouseUp(event) {
        if (this.canvas && this.canvas.onMouseUp) {
            this.canvas.onMouseUp(event)
        }

        if (this.page && this.page.onMouseUp) {
            this.page.onMouseUp(event)
        }
    }

    onWheel(event) {
        const normalizedWheel = normalizeWheel(event)

        if (this.canvas && this.canvas.onWheel) {
            this.canvas.onWheel(normalizedWheel)
        }

        if (this.page && this.page.onWheel) (
            this.page.onWheel(normalizedWheel)
        )

        if (this.preloader && this.preloader.onWheel) (
            this.preloader.onWheel(normalizedWheel)
        )
    }

    /**
     * Loops.
     */

    update() {

        if (this.page) (
            this.page.update()
        )

        // Bridge next-project scroll progress from Case page → Case canvas
        const nextProgress = this.page?.nextScrollProgress
        if (nextProgress !== undefined && this.canvas?.case) {
            this.canvas.case.nextProgress = nextProgress

            if (nextProgress >= 1 && this.page?.nextHref && !this.navigatingToNext) {
                this.navigatingToNext = true
                this.onChange({ url: this.page.nextHref, transition: { fromNextCaseScroll: true } })
            }
        }

        if (this.canvas && this.canvas.update) {
            this.canvas.update(this.page.scroll)
        }


        this.frame = window.requestAnimationFrame(this.update.bind(this))
    }



    /**
     * Listeners.
     */


    addEventListeners() {

        if (this.canvas && this.canvas.addEventListeners) {
            this.canvas.addEventListeners()
        }


        window.addEventListener('mousewheel', this.onWheel.bind(this))
        window.addEventListener('mousedown', this.onMouseDown.bind(this))
        window.addEventListener('mousemove', this.onMouseMove.bind(this))
        window.addEventListener('mouseup', this.onMouseUp.bind(this))

        window.addEventListener('touchstart', this.onMouseDown.bind(this))
        window.addEventListener('touchmove', this.onMouseMove.bind(this))
        window.addEventListener('touchend', this.onMouseUp.bind(this))


        window.addEventListener('resize', this.onResize.bind(this))
    }

    addLinkListeners() {
        const links = document.querySelectorAll('a[data-type="link"]')

        each(links, link => {

            link.addEventListener('click', (event) => {
                event.preventDefault()

                const { href } = link

                if (href === window.location.href) return

                let transition = null

                if (device.isTouch) {
                    this.onChange({ url: href })
                    return
                }

                if (this.template === 'home') {
                    const wrapper = link.closest('.case_gallery_link_wrapper')

                    if (wrapper) {
                        const allWrappers = [...document.querySelectorAll('.case_gallery_link_wrapper')]
                        const mediaIndex = allWrappers.indexOf(wrapper)
                        const headingEl = wrapper.querySelector('.case_gallery_count_heading')
                        const nameEl = wrapper.querySelector('.case_gallery_name')

                        this.lastMediaIndex = mediaIndex

                        transition = {
                            mediaIndex,
                            clickEvent: event,
                            fromHeadingBounds: headingEl ? headingEl.getBoundingClientRect() : null,
                            fromNameBounds: nameEl ? nameEl.getBoundingClientRect() : null,
                        }
                    }
                } else if (this.template === 'case') {
                    const cases = window.PAGES?.cases || []
                    const caseIndex = cases.findIndex(url => {
                        try { return new URL(url, window.location.origin).pathname === window.location.pathname }
                        catch { return false }
                    })

                    if (caseIndex !== -1) {
                        const caseBannerEl = document.querySelector('#case_banner_media img')
                        const caseHeadingEl = document.querySelector('.case_count_heading')
                        const caseNameEl = document.querySelector('.case_name')

                        transition = {
                            mediaIndex: caseIndex,
                            fromBannerBounds: caseBannerEl ? caseBannerEl.getBoundingClientRect() : null,
                            fromHeadingBounds: caseHeadingEl ? caseHeadingEl.getBoundingClientRect() : null,
                            fromNameBounds: caseNameEl ? caseNameEl.getBoundingClientRect() : null,
                        }
                    }
                }

                this.onChange({ url: href, transition })
            })
        })
    }
}

new App() 
