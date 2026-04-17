import * as THREE from "three"
import Home from "./Home"

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


    /**
     * Events.
     */
    onChangeStart() {
    }


    onChangeEnd() {
        if (this.template == 'home') {
            this.createHome()
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

    }


    onWheel(event) {
        if (this.home) {
            this.home.onWheel(event)
        }
    }


    update() {
        if (this.home) {
            this.home.update()
        }


        this.renderer.render(this.scene, this.camera)
    }
}