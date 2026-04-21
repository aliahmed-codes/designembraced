import gsap from "gsap"
import { each, map } from "lodash"
import Prefix from 'prefix'

import Paragraph from "./Paragraph"
import Title from "./Title"
import { splitByLines } from "../utils/text"

export default class Page {

    constructor({ element, elements, id }) {
        this.id = id
        this.selector = element
        this.selectorChildren = {
            ...elements,
            animationsTitles: '[data-animation="title"]',
            animationsParagraphs: '[data-animation="paragraph"]',
        }


        this.transformPrefix = Prefix('transform')

    }


    create() {

        this.element = document.querySelector(this.selector)
        this.elements = {}

        this.scroll = {
            target: 0,
            current: 0,
            limit: 0,
        }


        each(this.selectorChildren, (child, index) => {
            if (child instanceof window.HTMLElement || child instanceof window.NodeList || Array.isArray(child)) {
                this.elements[index] = child
            } else {
                this.elements[index] = this.element.querySelectorAll(child)

                if (this.elements[index].length === 0) {
                    this.elements[index] = null
                } else if (this.elements[index].length === 1) {
                    this.elements[index] = this.element.querySelector(child)
                }
            }
        })


    }



    /**
     * Animations.
     */


    animationsIn({ titles, paragraphs } = {}) {

        this.animations = []

        const toArray = el => !el ? [] : el instanceof NodeList ? Array.from(el) : Array.isArray(el) ? el : [el]

        if (titles) {
            this.animationsTitles = toArray(this.elements.animationsTitles).map(element => {
                splitByLines(element)

                return new Title({ element })
            })

            this.animations.push(...this.animationsTitles)
        }

        this.animationsParagraphs = toArray(this.elements.animationsParagraphs).map(element => {
            splitByLines(element)

            return new Paragraph({ element })
        })

        this.animations.push(...this.animationsParagraphs)

    }


    animationsOut() {
        if (!this.animations || !this.animations.length) {
            return Promise.resolve()
        }

        const promises = map(this.animations, animation => {
            const spans = animation.element.querySelectorAll('span span')

            return new Promise(resolve => {
                if (spans.length) {
                    gsap.to(spans, {
                        y: '-100%',
                        duration: 0.8,
                        ease: 'power3.in',
                        stagger: 0.03,
                        onComplete: resolve
                    })
                } else {
                    resolve()
                }
            })
        })

        return Promise.all(promises)
    }

    show({ titles = true, page = true } = {}) {

        this.animationIn = gsap.timeline()

        this.animationsIn({ titles })

        if (page) {
            this.animationIn.fromTo(this.element, {
                autoAlpha: 0,
            }, {
                autoAlpha: 1
            })
        }

    }

    async hide() {
        await this.animationsOut()

        return new Promise(resolve => {
            gsap.to(this.element, {
                autoAlpha: 0,
                duration: 0.5,
                onComplete: resolve
            })
        })
    }



    /**
     * Events.
     */
    onResize() {
        if (this.elements.wrapper) {
            this.scroll.limit = this.elements.wrapper.clientHeight - window.innerHeight
        }
    }

    onWheel(normalized) {
        const speed = normalized.pixelY

        this.scroll.target += speed

        return speed
    }



    /**
     * Loops.
     */

    update() {

        this.scroll.current = gsap.utils.interpolate(this.scroll.current, this.scroll.target, .1)


        this.scroll.current = gsap.utils.clamp(0, this.scroll.limit, this.scroll.current)



        if (this.scroll.target < 0.01) {
            this.scroll.target = 0
        }

        if (this.scroll.target > this.scroll.limit) {
            this.scroll.target = this.scroll.limit
        }


        if (this.elements.wrapper) {
            this.elements.wrapper.style[this.transformPrefix] = `translateY(-${this.scroll.current}px)`
        }

    }



}