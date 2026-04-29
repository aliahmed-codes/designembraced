import gsap from "gsap"
import Page from "../../classes/Page"
import device from "../../classes/DeviceDetection"
import { splitByLines } from "../../utils/text"

export default class Case extends Page {
    constructor() {
        super({
            id: "case",
            element: ".case",
            elements: {
                wrapper: '.case_wrapper',
                caseHeading: '.case_count_heading',
                caseName: '.case_name',
            }
        })
    }

    create() {
        super.create()

        const nextLink = document.querySelector('#case_next_banner_media .case_banner_media_link')
        this.nextHref = nextLink?.href || null
        this.nextScrollProgress = 0
        this.colorTl = null

        this.nextHeadingEl = document.querySelector('.next_case_wrapper .case_count_heading')
        this.nextNameEl = document.querySelector('.next_case_wrapper .case_name')

        this.transitionStartScroll = undefined
        this.transitionZone = undefined

        this.nextHeadSpans = this.nextHeadingEl ? splitByLines(this.nextHeadingEl) : []
        this.nextNameSpans = this.nextNameEl ? splitByLines(this.nextNameEl) : []

        if (this.nextHeadSpans.length) gsap.set(this.nextHeadSpans, { y: '-100%' })
        if (this.nextNameSpans.length) gsap.set(this.nextNameSpans, { y: '-100%' })

        this.calcTransitionStart()
    }

    calcTransitionStart() {
        if (!this.nextHref) return
        const img = document.querySelector('#case_next_banner_media img')
        if (!img) return
        // Measure with wrapper at scroll=0 so we get document coordinates
        const wrapper = this.elements.wrapper
        const prev = wrapper ? wrapper.style.transform : null
        if (wrapper) wrapper.style.transform = ''
        const rect = img.getBoundingClientRect()
        if (wrapper && prev !== null) wrapper.style.transform = prev
        // Start transition once the bottom of the next banner reaches the viewport bottom
        this.transitionStartScroll = Math.max(0, rect.bottom - window.innerHeight)
    }

    // Called by app.js once the next page HTML has been pre-fetched
    initColorTransition(nextBg, nextColor) {
        if (!nextBg) return
        const body = document.querySelector('body')
        const fromBg = getComputedStyle(body).backgroundColor
        const fromColor = getComputedStyle(body).color
        this.colorTl = gsap.timeline({ paused: true })
            .fromTo(body,
                { backgroundColor: fromBg, color: fromColor },
                { backgroundColor: nextBg, color: nextColor, ease: 'none', duration: 1 },
                0
            )
    }

    show({ onPreloader = false, transition = null } = {}) {
        if (onPreloader) {
            if (this.elements.caseHeading) {
                gsap.to(this.elements.caseHeading, { x: 0, y: 0, duration: 1.2, ease: 'power3.inOut' })
            }
            super.show({ titles: false, page: false })
        } else if (transition?.fromNextCaseScroll) {
            super.show({ titles: false })
        } else if (transition) {
            if (this.elements.caseHeading) {
                gsap.to(this.elements.caseHeading, { x: 0, y: 0, duration: 1, ease: 'power3.inOut' })
            }
            if (this.elements.caseName) {
                gsap.to(this.elements.caseName, { x: 10, y: 10, duration: 1, ease: 'power3.inOut' })
            }
            super.show({ titles: false })
        } else {
            super.show({ titles: false })
        }
    }

    onResize() {
        super.onResize()
        this.calcTransitionStart()

        // Compute zone from actual remaining scroll range so progress always reaches 1
        if (this.transitionStartScroll !== undefined && this.scroll?.limit) {
            this.transitionZone = Math.max(1, this.scroll.limit - this.transitionStartScroll)
        }
    }

    update() {
        super.update()

        if (!this.nextHref || this.transitionStartScroll === undefined || device.isTouch) {
            this.nextScrollProgress = 0
            return
        }

        const zone = this.transitionZone || (window.innerHeight * 0.7)
        const over = Math.max(0, this.scroll.current - this.transitionStartScroll)
        this.nextScrollProgress = Math.min(1, over / zone)

        if (this.nextScrollProgress <= 0) return

        // Color crossfade synced with scroll
        if (this.colorTl) this.colorTl.progress(this.nextScrollProgress)

        // Scroll-driven reveal: inner spans slide from y=-100% to y=0 (smoothstep)
        const t = this.nextScrollProgress * this.nextScrollProgress * (3 - 2 * this.nextScrollProgress)
        const yPercent = -100 + 100 * t

        if (this.nextHeadSpans.length) gsap.set(this.nextHeadSpans, { y: `${yPercent}%` })
        if (this.nextNameSpans.length) gsap.set(this.nextNameSpans, { y: `${yPercent}%` })
    }

    async hide() {
        // Visual transition handled by WebGL — resolve immediately
    }
}
