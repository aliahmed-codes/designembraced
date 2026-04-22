import * as THREE from "three"
import gsap from "gsap"
import Prefix from 'prefix'
import device from "../../../classes/DeviceDetection"

import fragment from "../../../../shaders/home-plane-fragment.glsl"
import vertex from "../../../../shaders/home-plane-vertex.glsl"


export default class Media {
    constructor({ element, index, scene, sizes, geometry, textureLoader }) {

        this.element = element
        this.index = index
        this.scene = scene
        this.sizes = sizes
        this.geometry = geometry
        this.textureLoader = textureLoader

        this.extra = {
            x: 0,
            y: 0
        }

        this.mobileNameEl = this.element.querySelector('.case_gallery_name--mobile')

        this.createTexture()
        this.createMaterial()
        this.createMesh()

        this.createBounds({ sizes: this.sizes })

        this.addEventListeners()

        this.transformPrefix = Prefix('transform')

    }


    createTexture() {
        this.image = this.element.querySelector('img')

        const cached = window.TEXTURES?.[this.image.src]

        if (cached) {
            this.texture = cached
        } else {
            this.media = new Image()
            this.media.crossOrigin = 'anonymous'
            this.media.src = this.image.src

            this.texture = new THREE.Texture(this.media)

            this.media.onload = () => {
                this.texture.needsUpdate = true
                this.material.uniforms.uImageSizes.value.set(
                    this.media.naturalWidth,
                    this.media.naturalHeight
                )
            }
        }
    }

    createMaterial() {
        const img = this.texture?.image
        const imgW = img?.naturalWidth || img?.width || 0
        const imgH = img?.naturalHeight || img?.height || 0

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                tMap: { value: this.texture },
                uImageSizes: { value: new THREE.Vector2(imgW, imgH) },
                uPlaneSizes: { value: new THREE.Vector2(0, 0) },
                uHover: { value: 0 },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uNormalizedY: { value: 0 }
            }
        })
    }


    createMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material)

        this.scene.add(this.mesh)

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

        this.material.uniforms.uPlaneSizes.value.set(this.mesh.scale.x, this.mesh.scale.y)
    }

    updateX(x = 0) {
        this.x = (this.bounds.left + x) / window.innerWidth

        this.mesh.position.x = (-this.sizes.width / 2) + (this.mesh.scale.x / 2) + (this.x * this.sizes.width) + this.extra.x
    }


    updateY(y = 0) {

        this.y = (this.bounds.top + y) / window.innerHeight

        this.mesh.position.y = (this.sizes.height / 2) - (this.mesh.scale.y / 2) - (this.y * this.sizes.height) + this.extra.y
    }




    /**
     * Events.
     */


    onResize(sizes) {
        this.extra.x = 0
        this.extra.y = 0
        this.element.style.transform = ''
        this.createBounds(sizes)
    }

    onMouseEnter() {
        gsap.to(this.material.uniforms.uHover, {
            value: 1,
            duration: 0.5,
            ease: 'power3.out',
            overwrite: true
        })
    }

    onMouseMove(e) {
        const rect = this.image.getBoundingClientRect()

        const x = (e.clientX - rect.left) / rect.width
        const y = 1.0 - (e.clientY - rect.top) / rect.height

        gsap.to(this.material.uniforms.uMouse.value, {
            x,
            y,
            duration: 0.5,
            ease: 'power3.out'
        })
    }

    onMouseleave() {
        gsap.to(this.material.uniforms.uHover, {
            value: 0,
            duration: 0.5,
            ease: 'power3.out',
            overwrite: true
        })
    }

    addEventListeners() {
        if (device.isTouch) return
        this.element.addEventListener('mouseenter', this.onMouseEnter.bind(this))
        this.element.addEventListener('mousemove', this.onMouseMove.bind(this))
        this.element.addEventListener('mouseleave', this.onMouseleave.bind(this))
    }


    removeEventListeners() {
        this.element.removeEventListener('mouseenter', this.onMouseEnter.bind(this));
        this.element.removeEventListener('mousemove', this.onMouseMove.bind(this));
        this.element.removeEventListener('mouseleave', this.onMouseleave.bind(this));
    }

    update(scroll, xOffset = 0, rotation = 0, normalizedY = 0, scrollNY = 0) {
        this.extra.x = (xOffset / window.innerWidth) * this.sizes.width
        this.updateX()
        this.updateY(-scroll)

        this.mesh.rotation.z = -rotation
        this.material.uniforms.uNormalizedY.value = scrollNY

        const extraYPx = -(this.extra.y * (window.innerHeight / this.sizes.height))
        const rotateDeg = rotation * (180 / Math.PI)

        this.element.style[this.transformPrefix] = `translateX(${xOffset}px) translateY(${extraYPx}px) rotate(${rotateDeg}deg)`
    }
}