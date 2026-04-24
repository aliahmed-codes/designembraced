import * as THREE from "three"
import device from "../../../classes/DeviceDetection"

import fragment from "../../../../shaders/case-plane-fragment.glsl"
import vertex from "../../../../shaders/case-plane-vertex.glsl"


export default class Media {
    constructor({ element, index, scene, sizes, geometry, textureLoader, foldEnabled = true, onVideoReady }) {

        this.element = element
        this.index = index
        this.scene = scene
        this.sizes = sizes
        this.geometry = geometry
        this.textureLoader = textureLoader
        this.foldEnabled = foldEnabled
        this.onVideoReady = onVideoReady

        this.isVideo = this.element?.tagName === 'VIDEO'

        this.createTexture()
        this.createMaterial()
        this.createMesh()
        this.createBounds({ sizes: this.sizes })
    }


    createTexture() {
        this.image = this.element

        if (this.isVideo) {
            this.element.crossOrigin = "anonymous"
            this.element.muted = true
            this.element.loop = true
            this.element.playsInline = true
            this.element.load()
            this.element.play().catch(() => { })

            this.texture = new THREE.VideoTexture(this.element)
            this.texture.minFilter = THREE.LinearFilter
            this.texture.magFilter = THREE.LinearFilter

            const onMetadata = () => {
                this.material.uniforms.uImageSizes.value.set(
                    this.element.videoWidth,
                    this.element.videoHeight
                )
                if (this.onVideoReady) this.onVideoReady()
            }

            if (this.element.readyState >= 1) {
                onMetadata()
            } else {
                this.element.addEventListener('loadedmetadata', onMetadata, { once: true })
            }

        } else {
            const cached = window.TEXTURES?.[this.element.src]

            if (cached) {
                this.texture = cached
                const img = cached.image
                this._cachedSize = { w: img.naturalWidth || img.width || 0, h: img.naturalHeight || img.height || 0 }
            } else {
                this.media = new Image()
                this.media.crossOrigin = "anonymous"
                this.media.src = this.element.src

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
    }

    createMaterial() {
        const w = this._cachedSize?.w || 0
        const h = this._cachedSize?.h || 0

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                tMap: { value: this.texture },
                uImageSizes: { value: new THREE.Vector2(w, h) },
                uPlaneSizes: { value: new THREE.Vector2(0, 0) },
                uNormalizedY: { value: 0 },
                uIdleTime: { value: 0 },
                uFlipCurve: { value: 0 },
            }
        })
    }

    createMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.scene.add(this.mesh)
    }

    createBounds({ sizes, currentScroll = 0 }) {
        this.sizes = sizes
        const rect = this.image.getBoundingClientRect()
        // Normalize to document coords — rect.top is viewport-relative and includes
        // any translateY applied to the wrapper, so adding currentScroll undoes that.
        this.bounds = {
            top: rect.top + currentScroll,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        }
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
     * Events.
     */

    updateScale() {
        this.width = this.bounds.width / window.innerWidth
        this.height = this.bounds.height / window.innerHeight

        this.mesh.scale.x = this.sizes.width * this.width
        this.mesh.scale.y = this.sizes.height * this.height

        this.material.uniforms.uPlaneSizes.value.set(this.mesh.scale.x, this.mesh.scale.y)
    }

    updateX() {
        this.x = this.bounds.left / window.innerWidth
        this.mesh.position.x = (-this.sizes.width / 2) + (this.mesh.scale.x / 2) + (this.x * this.sizes.width)
    }

    updateY(y = 0) {
        this.y = (this.bounds.top + y) / window.innerHeight
        this.mesh.position.y = (this.sizes.height / 2) - (this.mesh.scale.y / 2) - (this.y * this.sizes.height)
    }

    onResize({ sizes, currentScroll = 0 }) {
        this.createBounds({ sizes, currentScroll })
    }

    update(scroll, time = 0) {
        this.updateY(-scroll)

        if (this.foldEnabled && !device.isTouch) {
            const visualCenterY = this.bounds.top + this.bounds.height / 2 - scroll
            const d = visualCenterY - window.innerHeight / 2
            const normalizedY = Math.max(-1, Math.min(1, d / window.innerHeight))
            this.material.uniforms.uNormalizedY.value = normalizedY
        }

        this.material.uniforms.uIdleTime.value = time
    }
}