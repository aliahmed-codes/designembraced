import gsap from "gsap";
import Component from "../classes/Component";

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

    }


    init() {
        this.elements.navigation.classList.add('preloading')
        this.elements.footer.classList.add('preloading')

        this.state.totalProjects = window.ASSETS.projectsAssets.length

        this.elements.totalCont.textContent = `/${String(this.state.totalProjects).padStart(2, '0')}`

        if (this.template === "home") this.createHomeHeading()
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

    createLoader() {
        this.prepareAssets()

        this.loadProjects()
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
        for (const project of this.state.projects) {

            const promises = project.map((media) => {
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

            await Promise.all(promises);

            this.onProjectLoad(project);
        }
    }

    onProjectLoad() {
        this.state.projectLoaded += 1;

        const total = this.state.projects.length;
        const percentage = this.state.projectLoaded / total * 100;


        this.updateProgressLine(percentage)

        this.updateProjectCount()


        if (percentage === 100) {
            setTimeout(() => this.onLoaded(), 1000)
        }

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

    onLoaded() {

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
            this.emit('completed')
        })

    }

    destroy() {
        return new Promise((resolve) => {
            this.element.parentNode.removeChild(this.element)
            resolve()
        })
    }


}