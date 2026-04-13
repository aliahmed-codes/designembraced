import Component from "../classes/Component";

export default class Navigation extends Component {
    constructor() {
        super({
            element: '.navigation',
            elements: {
                hamburgerBtn: ".navigation_hamburger_wrapper",
                footer: document.querySelector('.footer')
            }
        })


    }

    handleToggle() {
        this.element.classList.toggle('active')
        this.elements.footer.classList.toggle('active')
    }

    addEventListeners() {
        this.elements.hamburgerBtn.addEventListener('click', this.handleToggle.bind(this))
    }
}