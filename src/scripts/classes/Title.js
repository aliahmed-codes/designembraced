import gsap from "gsap";
import Animation from "../classes/Animation";

export default class Title extends Animation {
    constructor({ element, elements }) {
        super({
            element,
            elements
        })
    }

    animateIn() {
        const spans = this.element.querySelectorAll('span span')

        gsap.from(spans, {
            y: '100%',
            duration: 1,
            ease: 'power3.out',
            stagger: 0.05,
            delay: 0.2,
            onComplete: () => {
                this.observer.disconnect()
            }
        })
    }

    animateOut() {
        const spans = this.element.querySelectorAll('span span')

        gsap.from(spans, {
            y: '-100%',
            duration: 1,
            ease: 'power3.out',
            stagger: 0.05,
            delay: 0.2,
            onComplete: () => {
                this.observer.disconnect()
            }
        })
    }
}
