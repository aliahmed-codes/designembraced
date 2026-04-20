import * as THREE from "three"
import { map } from "lodash"
import Prefix from 'prefix'

import Media from "./Media"

export default class Home {
    constructor({ scene, sizes }) {

        this.group = new THREE.Group()
        this.textureLoader = new THREE.TextureLoader()
        this.textureLoader.crossOrigin = 'anonymous'

        this.scene = scene
        this.sizes = sizes

        this.galleryElements = document.querySelector('.case_gallery_wrapper')
        this.mediasElements = document.querySelectorAll('.case_gallery_link_wrapper')


        this.createGeometry()
        this.createGalleries()


        this.scene.add(this.group)


        this.scroll = {
            target: 0,
            current: 0,
            last: 0,
            lerp: 0.1
        }

        this.transformPrefix = Prefix('transform')


    }


    createGeometry() {
        this.geometry = new THREE.PlaneGeometry(1, 1, 30, 30)
    }


    createGalleries() {
        this.medias = map(this.mediasElements, (element, index) => {
            return new Media({
                element,
                index,
                scene: this.group,
                sizes: this.sizes,
                geometry: this.geometry,
                textureLoader: this.textureLoader
            })
        })
    }



    onResize(event) {

        this.galleryBounds = this.galleryElements.getBoundingClientRect()

        this.sizes = event.sizes;


        this.gallerySizes = {
            height: this.galleryBounds.height / window.innerHeight * this.sizes.height,
            width: this.galleryBounds.width / window.innerWidth * this.sizes.width
        }

        this.sizes.y = this.scroll.target = 0

        map(this.medias, media => media.onResize(event))
    }



    onWheel({ pixelX, pixelY }) {
        this.scroll.target += pixelY

        clearTimeout(this.snapTimeout)
        this.snapTimeout = setTimeout(() => this.snapToNearest(), 200)
    }

    snapToNearest() {
        if (!this.medias || !this.medias.length) return

        let snapTarget = this.scroll.target
        let closestDist = Infinity

        map(this.medias, media => {
            const extraPx = -(media.extra.y * (window.innerHeight / this.sizes.height))

            const candidateTarget = media.bounds.top + media.bounds.height / 2 + extraPx - window.innerHeight / 2

            const dist = Math.abs(candidateTarget - this.scroll.current)

            if (dist < closestDist) {
                closestDist = dist
                snapTarget = candidateTarget
            }
        })

        this.scroll.target = snapTarget
    }

    addEventListeners() {
        map(this.medias, media => media.addEventListeners())
    }

    removeEventListeners() {
        map(this.medias, media => media.removeEventListeners())
    }

    update() {
        this.scroll.current += (this.scroll.target - this.scroll.current) * this.scroll.lerp

        if (this.galleryElements) {
            this.galleryElements.style[this.transformPrefix] = `translateY(${-this.scroll.current}px)`
        }

        if (this.medias && this.gallerySizes) {
            const direction = this.scroll.current > this.scroll.last ? 'up' : 'down'

            map(this.medias, media => {
                const scaleY = media.mesh.scale.y / 2 + 0.25

                if (direction === 'up') {
                    if (media.mesh.position.y - scaleY > this.sizes.height / 2) {
                        media.extra.y -= this.gallerySizes.height
                    }
                } else {
                    if (media.mesh.position.y + scaleY < -this.sizes.height / 2) {
                        media.extra.y += this.gallerySizes.height
                    }
                }

                const R = 1200
                const extraYPx = -(media.extra.y * (window.innerHeight / this.sizes.height))
                const visualCenterY = media.bounds.top + media.bounds.height / 2 - this.scroll.current + extraYPx
                const d = visualCenterY - window.innerHeight / 2
                const theta = Math.asin(Math.max(-1, Math.min(1, d / R)))
                const xOffset = R * (Math.cos(theta) - 1)

                const normalizedY = Math.max(-1, Math.min(1, d / R))
                media.update(this.scroll.current, xOffset, theta, normalizedY)
            })
        }

        this.scroll.last = this.scroll.current
    }

    destroy() {
        this.scene.remove(this.group)
    }
}