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
     * Animations.
     */
    show() {
        if (this.home) this.home.show()

        if (this.about) this.about.show()

        if (this.case) this.case.show()
    }

    hide() {
        if (this.home) this.home.hide()

        if (this.about) this.about.hide()

        if (this.case) this.case.hide()
    }


    /**
     * Events.
     */

    onPreloaded({ onPreloader } = {}) {
        this.onChangeEnd(this.template, onPreloader)
    }

    onChangeStart() {
        this.hide()
    }


    onChangeEnd(template, onPreloader, transition) {
        this.template = template

        const isHomeToCaseTransition = template === 'case' && transition && this.home && !device.isTouch
        const isCaseToHomeTransition = template === 'home' && transition && this.case && !device.isTouch

        if (template === 'home') {
            this.createHome(onPreloader)
            this.addEventListeners()

            if (isCaseToHomeTransition) {
                // Scroll home gallery to center the case we came from
                this.home.scrollToMedia(transition.mediaIndex)

                // Hide the specific gallery media — case banner plane animates to it
                if (this.home?.medias?.[transition.mediaIndex]) {
                    this.home.medias[transition.mediaIndex].mesh.visible = false
                }

                const allWrappers = document.querySelectorAll('.case_gallery_link_wrapper')
                const targetWrapper = allWrappers[transition.mediaIndex]
                const targetImg = targetWrapper?.querySelector('img')
                const targetBounds = targetImg ? targetImg.getBoundingClientRect() : null

                this.case.animateToBounds(0, targetBounds, this.sizes, () => {
                    this.destroyCase()
                    if (this.home?.medias?.[transition.mediaIndex]) {
                        this.home.medias[transition.mediaIndex].mesh.visible = true
                    }
                })
            }
        } else if (this.home && !isHomeToCaseTransition) {
            this.destroyHome()
        }

        if (!device.isTouch) {
            if (template === 'case') {
                this.destroyCase()
                this.createCase()

                if (isHomeToCaseTransition) {
                    // Hide case banner while home media flips and scales to it
                    if (this.case?.medias?.[0]) {
                        this.case.medias[0].mesh.visible = false
                    }

                    const caseBanner = document.querySelector('#case_banner_media img')
                    const bannerBounds = caseBanner ? caseBanner.getBoundingClientRect() : null

                    this.home.animateToCase(
                        transition.mediaIndex,
                        bannerBounds,
                        this.sizes,
                        () => {
                            this.destroyHome()
                            if (this.case?.medias?.[0]) {
                                this.case.medias[0].mesh.visible = true
                            }
                        }
                    )
                }
            } else if (this.case && !isCaseToHomeTransition) {
                // Keep case canvas alive during reverse transition — animateToBounds destroys it
                this.destroyCase()
            }


            if (template === 'about') {
                this.createAbout()
            } else if (this.about) {
                this.destroyAbout()
            }
        }

        this.show()
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

    onMouseDown(event) {
        if (event.type === 'mousedown' && event.button !== 0) return

        this.isDragging = true

        const point = event.touches ? event.touches[0] : event

        this.dragLastY = point.clientY
    }

    onMouseMove(event) {
        if (this.about && this.about.onMouseMove) this.about.onMouseMove(event)

        if (!this.isDragging) return

        if (event.type === 'mousemove' && event.buttons === 0) {
            this.isDragging = false; return
        }

        const point = event.touches ? event.touches[0] : event
        const deltaY = this.dragLastY - point.clientY

        this.dragLastY = point.clientY

        if (deltaY === 0) return

        this.onWheel({ pixelY: deltaY * 2 })
    }

    onMouseUp() {
        this.isDragging = false
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