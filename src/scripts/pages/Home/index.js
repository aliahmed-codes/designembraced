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
            }
        })

        this.canvas = canvas

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