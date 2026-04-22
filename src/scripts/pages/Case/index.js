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

    show({ onPreloader = false, transition = null } = {}) {
        if (onPreloader) {
            // Animate case heading from preloader text position to natural position
            if (this.elements.caseHeading) {
                gsap.to(this.elements.caseHeading, {
                    x: 0,
                    y: 0,
                    duration: 1.2,
                    ease: 'power3.inOut'
                })
            }

            super.show({ titles: false, page: false })
        } else if (transition) {
            // FLIP: heading and name arrive from home gallery positions
            if (this.elements.caseHeading) {
                gsap.to(this.elements.caseHeading, {
                    x: 0,
                    y: 0,
                    duration: 1,
                    ease: 'power3.inOut'
                })
            }

            if (this.elements.caseName) {
                gsap.to(this.elements.caseName, {
                    x: 10,
                    y: 10,
                    duration: 1,
                    ease: 'power3.inOut'
                })
            }

            super.show({ titles: false })
        } else {
            super.show()
        }
    }
}
