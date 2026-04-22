import * as THREE from "three"
import gsap from "gsap"

import fragment from "../../../../shaders/about-plane-fragment.glsl"
import vertex from "../../../../shaders/about-plane-vertex.glsl"


export default class About {
    constructor({ scene, sizes }) {
        this.group = new THREE.Group()

        this.scene = scene
        this.sizes = sizes

        this.backgroundImage = document.querySelector('.about_bg_media')

        this.mouse = new THREE.Vector2(0.5, 0.5)
        this.targetMouse = new THREE.Vector2(0.5, 0.5)

        this.createGeometry()
        this.createTexture()
        this.createMaterial()
        this.createMesh()
        this.createBounds({ sizes: this.sizes })

        this.scene.add(this.group)
    }

    createGeometry() {
        this.geometry = new THREE.PlaneGeometry(1, 1, 50, 50)
    }

    createTexture() {
        this.image = this.backgroundImage.querySelector('img')

        const cached = window.TEXTURES?.[this.image.src]

        if (cached) {
            this.texture = cached
        } else {
            this.media = new Image()
            this.media.crossOrigin = "anonymous"
            this.media.src = this.image.src

            this.texture = new THREE.Texture(this.media)

            this.media.onload = () => {
                this.texture.needsUpdate = true
            }
        }
    }

    createMaterial() {
        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
            uniforms: {
                tMap: { value: this.texture },
                uMouse: { value: this.mouse },
                uParallax: { value: 0.03 }
            }
        })
    }

    createMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.group.add(this.mesh)
    }

    createBounds({ sizes }) {
        this.sizes = sizes

        this.bounds = this.image.getBoundingClientRect()

        this.updateScale()
        this.updateX()
        this.updateY()
    }

    /**
    * Animations.
    */

    show() {
    }

    hide() {
    }


    /**
     * Updates.
     */
    updateScale() {
        this.width = this.bounds.width / window.innerWidth
        this.height = this.bounds.height / window.innerHeight

        this.mesh.scale.x = this.sizes.width * this.width
        this.mesh.scale.y = this.sizes.height * this.height
    }

    updateX(x = 0) {
        this.x = (this.bounds.left + x) / window.innerWidth
        this.mesh.position.x = (-this.sizes.width / 2) + (this.mesh.scale.x / 2) + (this.x * this.sizes.width)
    }

    updateY(y = 0) {
        this.y = (this.bounds.top + y) / window.innerHeight
        this.mesh.position.y = (this.sizes.height / 2) - (this.mesh.scale.y / 2) - (this.y * this.sizes.height)
    }

    onResize({ sizes }) {
        this.createBounds({ sizes })
    }

    onMouseMove(event) {
        this.targetMouse.x = event.clientX / window.innerWidth
        this.targetMouse.y = 1.0 - event.clientY / window.innerHeight
    }

    update(scroll) {
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05

        const scrollY = scroll ? scroll.current : 0
        const scrollLimit = scroll && scroll.limit > 0 ? scroll.limit : window.innerHeight
        const t = Math.min(1, Math.max(0, scrollY / scrollLimit))
        const parallaxPx = (0.5 - t) * 100

        this.updateY(parallaxPx)
    }

    destroy() {
        this.scene.remove(this.group)
    }
}
