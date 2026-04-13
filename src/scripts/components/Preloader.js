import gsap from "gsap";
import Component from "../classes/Component";

export default class Preloader extends Component {
    constructor() {
        super({
            element: '.preloader',
            elements: {
                loadingLine: '.preloader_loading_line',
                currentCont: '.current_count',
                totalCont: '.total_count',
                navigation: document.querySelector('.navigation'),
                footer: document.querySelector(".footer"),
            }
        })

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

        this.elements.totalCont.textContent = `/ ${String(this.state.totalProjects).padStart(2, '0')}`
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
            this.onLoaded()
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


        this.animateOut = gsap.timeline({
            delay: 1
        })


        this.animateOut.to(this.element, {
            opacity: 0,
            duration: .5,
            ease: "expo.out",
        })

        this.updateComponents()


        this.animateOut.call(_ => {
            this.destroy()
        })


    }

    destroy() {


        this.element.parentNode.removeChild(this.element)
    }


}