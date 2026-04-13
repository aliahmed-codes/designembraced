import { each } from "lodash"
import About from "./pages/About"
import Case from "./pages/Case"
import Home from "./pages/Home"


import Navigation from "./components/Navigation"
import Preloader from "./components/Preloader"

class App {

    constructor() {

        this.createContent()

        this.createPages()
        this.createNavigation()
        this.createPreloader()


        this.addLinkListeners()
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
    }


    createNavigation() {
        this.navigation = new Navigation()
    }

    createPreloader() {
        this.preloader = new Preloader()
    }



    /**
     * Events.
     */

    async onChange({ url }) {

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


            this.addLinkListeners()

        } else {
            console.log("Error");
        }
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
