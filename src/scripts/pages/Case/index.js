import gsap from "gsap"
import Page from "../../classes/Page"

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
        this._colorTl  = null

        this._nextHeading = document.querySelector('.next_case_wrapper .case_count_heading')
        this._nextName    = document.querySelector('.next_case_wrapper .case_name')
        this._heroHeading = document.querySelector('.case_hero_wrapper .case_count_heading')
        this._heroName    = document.querySelector('.case_hero_wrapper .case_name')

        // Document positions stored at layout time (set in _storeDocPositions)
        this._nextHeadDocTop  = undefined
        this._nextHeadDocLeft = undefined
        this._nextNameDocTop  = undefined
        this._nextNameDocLeft = undefined
        this._heroHeadDocTop  = undefined
        this._heroHeadDocLeft = undefined
        this._heroNameDocTop  = undefined
        this._heroNameDocLeft = undefined

        this._transitionStartScroll = undefined
        this._transitionZone = undefined

        this._calcTransitionStart()
        this._storeDocPositions()
    }

    _calcTransitionStart() {
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
        this._transitionStartScroll = Math.max(0, rect.bottom - window.innerHeight)
    }

    _storeDocPositions() {
        // Temporarily remove the scroll transform so getBoundingClientRect = document position
        const wrapper = this.elements.wrapper
        const prev = wrapper ? wrapper.style.transform : null
        if (wrapper) wrapper.style.transform = ''

        if (this._nextHeading) {
            const r = this._nextHeading.getBoundingClientRect()
            this._nextHeadDocTop  = r.top
            this._nextHeadDocLeft = r.left
        }
        if (this._nextName) {
            const r = this._nextName.getBoundingClientRect()
            this._nextNameDocTop  = r.top
            this._nextNameDocLeft = r.left
        }
        if (this._heroHeading) {
            const r = this._heroHeading.getBoundingClientRect()
            this._heroHeadDocTop  = r.top
            this._heroHeadDocLeft = r.left
        }
        if (this._heroName) {
            const r = this._heroName.getBoundingClientRect()
            this._heroNameDocTop  = r.top
            this._heroNameDocLeft = r.left
        }

        if (wrapper && prev !== null) wrapper.style.transform = prev
    }

    // Called by app.js once the next page HTML has been pre-fetched
    _initColorTransition(nextBg, nextColor) {
        if (!nextBg) return
        const body = document.querySelector('body')
        const fromBg    = getComputedStyle(body).backgroundColor
        const fromColor = getComputedStyle(body).color
        this._colorTl = gsap.timeline({ paused: true })
            .fromTo(body,
                { backgroundColor: fromBg,    color: fromColor },
                { backgroundColor: nextBg,     color: nextColor, ease: 'none', duration: 1 },
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
            // Coming from scroll-driven next-case transition — no heading animation
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
            super.show()
        }
    }

    onResize() {
        super.onResize()
        this._calcTransitionStart()

        // Compute zone from actual remaining scroll range so progress always reaches 1
        if (this._transitionStartScroll !== undefined && this.scroll?.limit) {
            this._transitionZone = Math.max(1, this.scroll.limit - this._transitionStartScroll)
        }

        // Refresh document-position snapshots for per-frame FLIP computation
        this._storeDocPositions()
    }

    update() {
        super.update()

        if (!this.nextHref || this._transitionStartScroll === undefined) {
            this.nextScrollProgress = 0
            return
        }

        const zone = this._transitionZone || (window.innerHeight * 0.7)
        const over = Math.max(0, this.scroll.current - this._transitionStartScroll)
        this.nextScrollProgress = Math.min(1, over / zone)

        if (this.nextScrollProgress <= 0) return

        // Color crossfade synced with scroll
        if (this._colorTl) this._colorTl.progress(this.nextScrollProgress)

        // Per-frame FLIP: interpolate next heading toward hero heading's viewport position
        const S = this.scroll.current
        const t = this.nextScrollProgress * this.nextScrollProgress * (3 - 2 * this.nextScrollProgress)

        if (this._nextHeading && this._nextHeadDocTop !== undefined && this._heroHeadDocTop !== undefined) {
            const dx = (this._heroHeadDocLeft - this._nextHeadDocLeft) * t
            const dy = (this._heroHeadDocTop  - (this._nextHeadDocTop - S)) * t
            this._nextHeading.style.transform = `translate(${dx}px, ${dy}px)`
        }

        if (this._nextName && this._nextNameDocTop !== undefined && this._heroNameDocTop !== undefined) {
            const dx = (this._heroNameDocLeft - this._nextNameDocLeft) * t
            const dy = (this._heroNameDocTop  - (this._nextNameDocTop - S)) * t
            this._nextName.style.transform = `translate(${dx}px, ${dy}px)`
        }
    }

    async hide() {
        // Visual transition handled by WebGL — resolve immediately
    }
}
