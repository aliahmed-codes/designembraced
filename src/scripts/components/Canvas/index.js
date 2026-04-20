import * as THREE from "three"
import Home from "./Home"
import Case from "./Case"

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

        document.body.appendChild(this.renderer.domElement)
    }

    /**
     * Home.
     */

    createHome() {
        this.home = new Home({
            scene: this.scene,
            sizes: this.sizes
        })
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
     * Events.
     */

    onPreloaded() {
        this.onChangeEnd(this.template)
    }

    onChangeStart() {
    }


    onChangeEnd(template) {
        this.template = template

        if (this.template == 'home') {
            this.createHome()
        } else if (this.home) {
            this.destroyHome()
        }

        if (this.template == 'case') {
            this.destroyCase()

            this.createCase()
        } else if (this.case) {
            this.destroyCase()
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

    }


    onWheel(event) {
        if (this.home) {
            this.home.onWheel(event)
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

        this.renderer.render(this.scene, this.camera)
    }
}