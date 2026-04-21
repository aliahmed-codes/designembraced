import gsap from "gsap";
import { map } from "lodash";

import Component from "../classes/Component";
import device from "../classes/DeviceDetection";
import Title from "../classes/Title";
import Paragraph from "../classes/Paragraph";

import { splitByLines } from "../utils/text";


export default class Preloader extends Component {
    constructor({ template }) {
        super({
            element: '.preloader',
            elements: {
                loadingLine: '.preloader_loading_line',
                currentCont: '.current_count',
                totalCont: '.total_count',
                preloaderText: '.preloader_text',
                navigation: document.querySelector('.navigation'),
                footer: document.querySelector(".footer"),

                animationsTitles: '[data-animation="title"]',
                animationsParagraphs: '[data-animation="paragraph"]',

                firstCaseHeading: document.querySelector('.case_1 .case_gallery_count_heading'),

            }
        })

        this.template = template

        this.state = {
            projects: [],
            projectLoaded: 0,
            totalProjects: 0
        }

        this.init()

        this.createLoader()

        this.createTabletLoader()


    }


    init() {
        this.elements.navigation.classList.add('preloading')
        this.elements.footer.classList.add('preloading')

        this.state.totalProjects = window.ASSETS.projectsAssets.length

        this.elements.totalCont.textContent = `/${String(this.state.totalProjects).padStart(2, '0')}`

        if (device.isTouch && this.template !== 'home') {
            this.element.style.opacity = '0'
            this.element.style.pointerEvents = 'none'
            return
        }

        if (this.template === "home" && !device.isTouch) this.createHomeHeading()
    }




    createHomeHeading() {

        const from = this.elements.preloaderText.getBoundingClientRect()
        const to = this.elements.firstCaseHeading.getBoundingClientRect()

        gsap.set(this.elements.firstCaseHeading, {
            x: from.left - to.left + 10,
            y: from.top - to.top,
            duration: .5,
            ease: 'power3.inOut'
        })
    }


    createTabletLoader() {
        if (!device.isTouch || this.template !== 'home') return

        this.animationsIn()

        this.dismissed = false

        const interact = () => {
            if (this.dismissed) return
            this.dismissed = true
            window.removeEventListener('touchstart', interact)
            window.removeEventListener('click', interact)
            window.removeEventListener('wheel', interact)
            this.onTabletDismiss()
        }

        window.addEventListener('touchstart', interact)
        window.addEventListener('click', interact)
        window.addEventListener('wheel', interact)
    }

    animationsIn() {

        this.animations = []

        const toArray = el => !el ? [] : el instanceof NodeList ? Array.from(el) : Array.isArray(el) ? el : [el]

        this.animationsTitles = toArray(this.elements.animationsTitles).map(element => {
            splitByLines(element)

            return new Title({ element })
        })

        this.animations.push(...this.animationsTitles)

        this.animationsParagraphs = toArray(this.elements.animationsParagraphs).map(element => {
            splitByLines(element)

            return new Paragraph({ element })
        })

        this.animations.push(...this.animationsParagraphs)

    }

    animationsOut() {
        if (!this.animations || !this.animations.length) {
            return Promise.resolve()
        }

        const promises = map(this.animations, animation => {
            const spans = animation.element.querySelectorAll('span span')

            return new Promise(resolve => {
                if (spans.length) {
                    gsap.to(spans, {
                        y: '-100%',
                        duration: 0.8,
                        ease: 'power3.in',
                        stagger: 0.03,
                        onComplete: resolve
                    })
                } else {
                    resolve()
                }
            })
        })

        return Promise.all(promises)
    }


    createLoader() {
        if (device.isTouch) return

        this.prepareAssets()
        this.createCache()
        this.startLoading()
    }

    createCache() {
        this.cache = new Map()

        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i)
            if (key.startsWith('page:')) {
                this.cache.set(key.slice(5), sessionStorage.getItem(key))
            }
        }
    }


    async startLoading() {
        if (device.isTouch) {
            this.loadProjects().catch(() => { })
            this.prefetchSilentPages().catch(() => { })
            this.onLoaded()
            return
        }

        await Promise.all([
            this.loadProjects(),
            this.prefetchSilentPages()
        ])

        setTimeout(() => this.onLoaded(), 1000)
    }


    prepareAssets() {
        const assets = window.ASSETS
        const projectsData = assets.projectsAssets

        if (!projectsData) return

        this.state.projects = projectsData.map(project => {
            const mediaList = []

            if (project.main) {
                mediaList.push({ type: 'image', url: project.main })
            }

            if (project.media) {
                project.media.forEach(media => {
                    if (media.url) {
                        mediaList.push({
                            type: media.type,
                            url: media.url
                        })
                    }
                })
            }

            return mediaList
        })


        if (assets.aboutBanner) {
            this.state.projects[0].unshift({
                type: 'image',
                url: assets.aboutBanner
            })
        }

    }


    async loadProjects() {
        const caseUrls = window.PAGES?.cases || []

        for (let i = 0; i < this.state.projects.length; i++) {
            const project = this.state.projects[i]
            const caseUrl = caseUrls[i]

            const mediaPromises = project.map((media) => {
                return new Promise((resolve) => {

                    if (media.type === 'image') {

                        const image = new Image();

                        image.onload = resolve;
                        image.onerror = resolve;

                        image.src = media.url;
                    }
                    else if (media.type === 'video') {
                        const video = document.createElement('video')

                        video.onloadeddata = resolve
                        video.onerror = resolve

                        video.src = media.url
                        video.load()
                    }
                });
            });

            const pagePromise = caseUrl ? this.prefetchPage(caseUrl) : Promise.resolve()

            await Promise.all([...mediaPromises, pagePromise])

            this.onProjectLoad()
        }
    }


    // Fetch home and about silently — no count contribution
    async prefetchSilentPages() {
        const pages = window.PAGES
        if (!pages) return

        const urls = [pages.home, pages.about].filter(Boolean)

        await Promise.all(urls.map(url => this.prefetchPage(url)))
    }


    async prefetchPage(url) {
        const fullUrl = new URL(url, window.location.origin).href

        if (this.cache.has(fullUrl)) return

        try {
            const response = await fetch(fullUrl)
            if (response.ok) {
                const html = await response.text()
                this.cache.set(fullUrl, html)
                sessionStorage.setItem(`page:${fullUrl}`, html)
            }
        } catch (_) {
            // silently fail — page will be fetched on navigation
        }
    }


    onProjectLoad() {
        this.state.projectLoaded += 1

        const percentage = this.state.projectLoaded / this.state.totalProjects * 100

        this.updateProgressLine(percentage)
        this.updateProjectCount()
    }


    updateProjectCount() {
        this.elements.currentCont.textContent = `PR.${String(this.state.projectLoaded).padStart(2, '0')}`
    }

    updateProgressLine(percentage) {
        this.elements.loadingLine.style.scale = `${percentage}%`
    }


    updateComponents() {
        this.elements.navigation.classList.remove('preloading')
        this.elements.footer.classList.remove('preloading')
    }


    onDesktopLoad() {
        if (this.template === "home")
            this.elements.currentCont.textContent = `PR.${String(1).padStart(2, '0')}`

        this.animateOut = gsap.timeline({
            delay: 1
        })

        this.animateOut.to(this.element, {
            opacity: 0,
            duration: .5,
            ease: "expo.out",
        })

        this.updateComponents()


        this.animateOut.call(async _ => {
            await this.destroy()
            this.emit('completed', this.cache)
        })
    }


    onTabletLoad() {
        if (this.template !== 'home') {
            this.updateComponents()
            this.emit('completed', this.cache)
            this.destroy()
        }
    }

    async onTabletDismiss() {
        await this.animationsOut()

        gsap.to(this.element, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
                this.updateComponents()
                this.emit('completed', this.cache)
                this.destroy()
            }
        })
    }

    onLoaded() {
        device.isTouch ? this.onTabletLoad() : this.onDesktopLoad()
    }

    destroy() {
        return new Promise((resolve) => {
            this.element.parentNode.removeChild(this.element)
            resolve()
        })
    }


}
