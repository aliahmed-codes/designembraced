import Component from "./Component"

export default class Animation extends Component {
    constructor({ element, elements }) {
        super({ element, elements })

        this.createObserver()

    }

    createObserver() {

        this.observer = new window.IntersectionObserver(entries => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.animateIn()
                }
            })
        })

        this.observer.observe(this.element)
    }

    animateIn() { }


    onResize() { }
}