import gsap from "gsap"
import { each } from "lodash"


import Prefix from 'prefix'

export default class Page {

    constructor({ element, elements, id }) {
        this.id = id
        this.selector = element
        this.selectorChildren = {
            ...elements
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


        if (this.selectorChildren)
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

    show() {
        this.animationIn = gsap.timeline()

        this.animationIn.fromTo(this.element, {
            autoAlpha: 0,
        }, {
            autoAlpha: 1
        })
    }


    hide() {
        this.animationOut = gsap.timeline()

        this.animationOut.to(this.element, {
            autoAlpha: 0
        })
    }



    /**
     * Events.
     */
    onResize() {
        if (this.elements.wrapper) {
            this.scroll.limit = this.elements.wrapper.clientHeight - window.innerHeight
            console.log("limit", this.scroll.limit);
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