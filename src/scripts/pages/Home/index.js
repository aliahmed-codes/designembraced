import gsap from "gsap";
import Page from "../../classes/Page";

export default class Home extends Page {
    constructor() {

        super({
            id: "home",
            element: ".home",
            elements: {
                firstCaseHeading: document.querySelector('.case_1 .case_gallery_count_heading'),
            }
        })


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