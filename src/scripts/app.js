import { bind, each } from "lodash"
import About from "./pages/About"
import Case from "./pages/Case"
import Home from "./pages/Home"


import Navigation from "./components/Navigation"
import Preloader from "./components/Preloader"
import normalizeWheel from "normalize-wheel"

class App {

    constructor() {

        this.createContent()

        this.createPages()
        this.createNavigation()
        this.createPreloader()

        this.addEventListeners()
        this.addLinkListeners()


        this.onResize()
        this.update()
    }


    createContent() {
        this.content = document.querySelector('.content')
        this.bodyContent = document.querySelector('body')
        this.template = this.content.getAttribute('data-template')
    }


    createPages() {
        this.pages = {
            "home": new Home(),
            "about": new About(),
            "case": new Case(),
        }

        this.page = this.pages[this.template]

        this.page.create()

    }


    createNavigation() {
        this.navigation = new Navigation()
    }

    createPreloader() {
        this.preloader = new Preloader()

        this.preloader.once('completed', this.onPreloader.bind(this))

    }



    /**
     * Events.
     */


    onPreloader() {
        this.page.show()
    }

    async onChange({ url }) {

        this.page.hide()

        const request = await fetch(url)
        console.log(url);

        if (request.status === 200) {
            const html = await request.text()

            window.history.pushState({}, '', url)

            const div = document.createElement('div')

            div.innerHTML = html

            const divContent = div.querySelector('.content')

            this.template = divContent.getAttribute('data-template')
            this.backgroundColor = divContent.getAttribute('data-backgroundColor')
            this.textColor = divContent.getAttribute('data-color')

            this.bodyContent.style.backgroundColor = this.backgroundColor
            this.bodyContent.style.color = this.textColor
            this.content.setAttribute('data-template', this.template)


            this.content.innerHTML = divContent.innerHTML

            this.page = this.pages[this.template]

            this.page.create()
            
            this.onResize()


            await this.page.show()

            this.addLinkListeners()

        } else {
            console.log("Error");
        }
    }


    onResize() {

        if (this.page && this.page.onResize) (
            this.page.onResize()
        )
    }


    onWheel(event) {
        const normalizedWheel = normalizeWheel(event)

        if (this.page && this.page.onWheel) (
            this.page.onWheel(normalizedWheel)
        )
    }

    /**
     * Loops.
     */

    update() {

        if (this.page) (
            this.page.update()
        )


        this.frame = window.requestAnimationFrame(this.update.bind(this))
    }



    /**
     * Listeners.
     */


    addEventListeners() {
        window.addEventListener('mousewheel', this.onWheel.bind(this))

        window.addEventListener('resize', this.onResize.bind(this))

    }

    addLinkListeners() {
        const links = document.querySelectorAll('a')

        each(links, link => {

            link.addEventListener('click', (event) => {
                event.preventDefault()

                const { href } = link

                this.onChange({ url: href })
            })
        })
    }
}

new App() 
