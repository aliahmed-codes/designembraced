import gsap from "gsap";
import device from "../../classes/DeviceDetection";
import Page from "../../classes/Page";
import Title from "../../classes/Title";
import Paragraph from "../../classes/Paragraph";
import { splitByLines } from "../../utils/text";

export default class Home extends Page {
    constructor({ canvas }) {

        super({
            id: "home",
            element: ".home",
            elements: {
                firstCaseHeading: document.querySelector('.case_1 .case_gallery_count_heading'),
                homePreloader: '.home_preloader',
            }
        })

        this.canvas = canvas

    }

    create() {
        super.create()

        if (device.isTouch) {
            this.initPreloader()
        }
    }

    initPreloader() {
        if (!this.elements || !this.elements.homePreloader) return

        this.animationsIn()

        this.dismissed = false

        const interact = () => {
            if (this.dismissed) return
            this.dismissed = true
            window.removeEventListener('touchstart', interact)
            window.removeEventListener('click', interact)
            window.removeEventListener('wheel', interact)
            this.onDismiss()
        }

        window.addEventListener('touchstart', interact)
        window.addEventListener('click', interact)
        window.addEventListener('wheel', interact)
    }

    animationsIn() {
        this.animations = []

        const preloaderEl = this.elements.homePreloader
        if (!preloaderEl) return

        const toArray = el => !el ? [] : el instanceof NodeList ? Array.from(el) : Array.isArray(el) ? el : [el]

        const titleElements = preloaderEl.querySelectorAll('[data-animation="title"]')
        this.animationsTitles = toArray(titleElements).map(element => {
            splitByLines(element)
            return new Title({ element })
        })

        this.animations.push(...this.animationsTitles)

        const paraElements = preloaderEl.querySelectorAll('[data-animation="paragraph"]')
        this.animationsParagraphs = toArray(paraElements).map(element => {
            splitByLines(element)
            return new Paragraph({ element })
        })

        this.animations.push(...this.animationsParagraphs)
    }

    onDismiss() {
        this.animationsOut().then(() => {
            gsap.to(this.elements.homePreloader, {
                opacity: 0,
                duration: 0.4,
                ease: 'power2.out',
                onComplete: () => {
                    if (this.elements.homePreloader.parentNode) {
                        this.elements.homePreloader.parentNode.removeChild(this.elements.homePreloader)
                    }
                    this.show()
                    if (this.canvas && this.canvas.onPreloaded) {
                        this.canvas.onPreloaded()
                    }
                }
            })
        })
    }

    animationsOut() {
        if (!this.animations || !this.animations.length) {
            return Promise.resolve()
        }

        const promises = this.animations.map(animation => {
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


    show({ onPreloader = false } = {}) {
        if (onPreloader) {
            const timeline = gsap.timeline()

            timeline.to(this.elements.firstCaseHeading, {
                x: 0,
                y: 0,
                duration: 1.2,
                ease: 'power3.inOut'
            })

            super.show({ titles: false, page: false })
        } else {
            super.show()
        }
    }

    hind() {

    }

}