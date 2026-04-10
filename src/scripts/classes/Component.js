import { each } from "lodash"

export default class Component {
    constructor({ element, elements }) {
        this.selector = element
        this.selectorChildren = { ...elements }


        this.create()

        this.addEventListeners()
    }

    create() {

        if (this.selector instanceof window.HTMLElement) {
            this.element = this.selector
        } else {
            this.element = document.querySelector(this.selector)
        }

        this.elements = {}

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


    addEventListeners() { }
}