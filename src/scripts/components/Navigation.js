import { each } from "lodash";
import Component from "../classes/Component";
import { splitNavigationText } from "../utils/text";
import gsap from "gsap";

export default class Navigation extends Component {
    constructor() {
        super({
            element: '.navigation',
            elements: {
                hamburgerBtn: ".navigation_hamburger_wrapper",
                animationsTitles: '[data-animation="title"]',
                animationsParagraphs: '[data-animation="paragraph"]',
                footer: document.querySelector('.footer')
            }
        })

        this.createText()
    }


    createText() {
        this.titles = splitNavigationText(this.elements.animationsTitles)
        this.paragraphs = splitNavigationText(this.elements.animationsParagraphs)

        this.spans = [...this.titles, ...this.paragraphs]

        if (this.spans.length) {
            gsap.set(this.spans, { y: '100%' })
        }
    }


    animationsIn() {
        return new Promise(resolve => {
            gsap.to(this.spans, {
                y: '0%',
                duration: 0.8,
                ease: 'power3.out',
                stagger: 0.05,
                onComplete: resolve
            })
        })
    }


    animationsOut() {
        return new Promise(resolve => {
            gsap.to(this.spans, {
                y: '-100%',
                duration: 0.6,
                ease: 'power3.in',
                stagger: 0.03,
                onComplete: () => {
                    gsap.set(this.spans, { y: '100%' })
                    resolve()
                }
            })
        })
    }


    async handleToggle() {
        if (this.element.classList.contains('active')) {
            await this.animationsOut()
            this.element.classList.remove('active')
            this.elements.footer.classList.remove('active')
        } else {
            this.elements.footer.classList.add('active')
            this.element.classList.add('active')
            this.animationsIn()
        }
    }


    addEventListeners() {
        this.elements.hamburgerBtn.addEventListener('click', this.handleToggle.bind(this))
    }
}
