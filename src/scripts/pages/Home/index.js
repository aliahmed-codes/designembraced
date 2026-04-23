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


    show({ onPreloader = false, transition = null } = {}) {
        if (onPreloader) {
            const timeline = gsap.timeline()

            timeline.to(this.elements.firstCaseHeading, {
                x: 0,
                y: 0,
                duration: 1.2,
                ease: 'power3.inOut'
            })

            super.show({ titles: false, page: false })
        } else if (transition) {
            // Reverse FLIP: animate gallery heading/name back to natural positions
            const allWrappers = document.querySelectorAll('.case_gallery_link_wrapper')
            const wrapper = allWrappers[transition.mediaIndex]

            const galleryHeading = wrapper?.querySelector('.case_gallery_count_heading')
            const galleryName = wrapper?.querySelector('.case_gallery_name')

            if (galleryHeading) {
                gsap.to(galleryHeading, { x: 0, y: 0, duration: 1, ease: 'power3.inOut' })
            }
            if (galleryName) {
                gsap.to(galleryName, { x: 0, y: 0, duration: 1, ease: 'power3.inOut' })
            }

            super.show({ titles: false })
        } else {
            super.show()
        }
    }

    async hide() {

        console.log('dom home hide');

    }


}