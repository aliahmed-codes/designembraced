import * as THREE from "three"
import Home from "./Home"
import Case from "./Case"
import About from "./About"
import device from "../../classes/DeviceDetection"

export default class Canvas {
    constructor({ template }) {

        this.template = template

        this.createScene()

        this.createCamera()

        this.createRenderer()

        this.onResize()

    }


    createScene() {
        this.scene = new THREE.Scene()
    }


    createCamera() {
        const width = window.innerWidth
        const height = window.innerHeight

        this.camera = new THREE.PerspectiveCamera(
            45,
            width / height,
            0.1,
            1000
        )

        this.camera.position.z = 5
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        })

        if (!device.isTouch) document.body.appendChild(this.renderer.domElement)
    }

    /**
     * Home.
     */

    createHome(onPreloader) {
        this.home = new Home({
            scene: this.scene,
            sizes: this.sizes,
            onPreloader
        })

        this.home.onResize({ sizes: this.sizes })

        if (device.isTouch) {
            // this.home.enterFromBelow()
        }
    }


    destroyHome() {
        if (!this.home) return
        this.home.destroy()
        this.home = null

    }
    /**
     * Case.
     */

    createCase() {
        this.case = new Case({
            scene: this.scene,
            sizes: this.sizes
        })
    }


    destroyCase() {
        if (!this.case) return
        this.case.destroy()
        this.case = null

    }


    /**
     * About.
     */


    createAbout() {
        this.about = new About({
            scene: this.scene,
            sizes: this.sizes
        })
    }

    destroyAbout() {
        if (!this.about) return
        this.about.destroy()
        this.about = null

    }


    /**
     * Events.
     */

    onPreloaded({ onPreloader }) {
        this.onChangeEnd(this.template, onPreloader)
    }

    onChangeStart() {
    }


    onChangeEnd(template, onPreloader) {
        this.template = template

        if (this.template == 'home') {
            this.createHome(onPreloader)
            this.addEventListeners()
        } else if (this.home) {
            this.destroyHome()
        }

        if (!device.isTouch) {
            if (this.template == 'case') {
                this.destroyCase()
                this.createCase()
            } else if (this.case) {
                this.destroyCase()
            }

            if (this.template == 'about') {
                this.createAbout()
            } else if (this.about) {
                this.destroyAbout()
            }
        }
    }

    onResize() {
        const width = window.innerWidth
        const height = window.innerHeight

        this.renderer.setSize(width, height)

        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()


        const fov = this.camera.fov * (Math.PI / 180)
        const viewHeight = 2 * Math.tan(fov / 2) * this.camera.position.z
        const viewWidth = viewHeight * this.camera.aspect

        this.sizes = {
            height: viewHeight,
            width: viewWidth
        }

        const values = {
            sizes: this.sizes

        }

        if (this.home) {
            this.home.onResize(values)
        }

        if (this.case) {
            this.case.onResize(values)
        }

        if (this.about) {
            this.about.onResize(values)
        }

    }


    onWheel(event) {
        if (this.home) {
            this.home.onWheel(event)
        }
    }

    onMouseMove(event) {
        if (this.about) {
            this.about.onMouseMove(event)
        }
    }



    addEventListeners() {
        if (this.home) {
            this.home.addEventListeners()
        }
    }


    update(scroll) {
        if (this.home) {
            this.home.update()
        }

        if (this.case) {
            this.case.update(scroll)
        }

        if (this.about) {
            this.about.update(scroll)
        }

        if (!device.isTouch) this.renderer.render(this.scene, this.camera)
    }
}