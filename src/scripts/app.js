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

            this.bodyContent.style.backgroundColor = this.backgroundColor
            this.bodyContent.style.color = this.textColor
            this.content.setAttribute('data-template', this.template)

            this.content.innerHTML = divContent.innerHTML

            // Apply FLIP offsets before the page renders so there's no layout flash
            if (transition && this.template === 'case') {
                this.applyCaseTransitionOffsets(transition)
            }

            this.canvas.onChangeEnd(this.template, null, transition)

            this.page = this.pages[this.template]

            this.page.create()

            setTimeout(() => {
                this.onResize()
            }, 1000)

            await this.page.show({ transition })

            this.createNavigation()

            this.addLinkListeners()

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

        device.update()

        if (this.page && this.page.onResize) (
            this.page.onResize()
        )


        window.requestAnimationFrame(_ => {
            if (this.canvas && this.canvas.onResize) {
                this.canvas.onResize()
            }
        })
    }


    onMouseMove(event) {
        if (this.canvas && this.canvas.onMouseMove) {
            this.canvas.onMouseMove(event)
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
        window.addEventListener('mousemove', this.onMouseMove.bind(this))
        window.addEventListener('resize', this.onResize.bind(this))
    }

    addLinkListeners() {
        const links = document.querySelectorAll('a')

        each(links, link => {

            link.addEventListener('click', (event) => {
                event.preventDefault()

                const { href } = link

                if (href === window.location.href) return

                let transition = null

                if (this.template === 'home') {
                    const wrapper = link.closest('.case_gallery_link_wrapper')

                    if (wrapper) {
                        const allWrappers = [...document.querySelectorAll('.case_gallery_link_wrapper')]
                        const mediaIndex = allWrappers.indexOf(wrapper)
                        const headingEl = wrapper.querySelector('.case_gallery_count_heading')
                        const nameEl = wrapper.querySelector('.case_gallery_name')

                        transition = {
                            mediaIndex,
                            fromHeadingBounds: headingEl ? headingEl.getBoundingClientRect() : null,
                            fromNameBounds: nameEl ? nameEl.getBoundingClientRect() : null,
                        }
                    }
                }

                this.onChange({ url: href, transition })
            })
        })
    }
}

new App() 
