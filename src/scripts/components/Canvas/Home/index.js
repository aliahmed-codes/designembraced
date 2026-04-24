import * as THREE from "three"
import gsap from "gsap"
import { map } from "lodash"
import Prefix from 'prefix'

import Media from "./Media"

import device from "../../../classes/DeviceDetection"
import Title from "../../../classes/Title"
import { splitByLines } from "../../../utils/text"

export default class Home {
    constructor({ scene, sizes, onPreloader }) {
        this.group = new THREE.Group()
        this.textureLoader = new THREE.TextureLoader()
        this.textureLoader.crossOrigin = 'anonymous'

        this.scene = scene
        this.sizes = sizes


        this.scroll = {
            target: 0,
            current: 0,
            last: 0,
            lerp: 0.1
        }


        this.galleryElements = document.querySelector('.case_gallery_wrapper')
        this.mediasElements = document.querySelectorAll('.case_gallery_link_wrapper')

        this.createGeometry()
        this.createGalleries()

        if (onPreloader && device.isTouch) this.createHomePreloader()

        this.scene.add(this.group)



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


    createHomePreloader() {
        this.homePreloader = document.querySelector('.mobile_preloader')
        this.preloaderAnimations = this.homePreloader.querySelectorAll('[data-animation="preloaderAnimation"]')

        this.animationsIn()

        this.setInitPosition()

        this.addEventListeners()
    }


    /**
       * Animations.
       */


    animationsIn() {

        this.animations = []

        const toArray = el => !el ? [] : el instanceof NodeList ? Array.from(el) : Array.isArray(el) ? el : [el]

        this.animationsEL = toArray(this.preloaderAnimations).map(element => {
            splitByLines(element)

            return new Title({ element })
        })

        this.animations.push(...this.animationsEL)

    }


    scrollToMedia(mediaIndex) {
        if (!this.medias || mediaIndex >= this.medias.length) return
        const media = this.medias[mediaIndex]
        if (!media) return
        const scrollY = media.bounds.top + media.bounds.height / 2 - window.innerHeight / 2
        this.scroll.current = this.scroll.last = this.scroll.target = scrollY
    }

    setInitPosition() {
        if (!this.medias || !this.medias.length) return

        const lastMedia = this.medias[this.medias.length - 1]
        const scrollY = lastMedia.bounds.top + lastMedia.bounds.height / 2 - window.innerHeight / 2

        this.medias[this.medias.length - 1].mesh.visible = false
        this.mediasElements[this.mediasElements.length - 1].style.opacity = 0

        this.scroll.current = this.scroll.last = this.scroll.target = scrollY
        this.preloaderInitScroll = scrollY
        this.isPreloaderActive = true
    }



    /**
     * Animations.
     */

    show() {

        map(this.medias, (media) => media.show());
    }

    hide() {
        console.log('canvas home hide');

        map(this.medias, (media) => media.hide());
    }

    /**
     * Events.
     */


    onResize(event) {
        const savedScroll = this.scroll.current

        // Reset transform before measuring so getBoundingClientRect is not offset
        if (this.galleryElements) {
            this.galleryElements.style[this.transformPrefix] = ''
        }

        this.galleryBounds = this.galleryElements.getBoundingClientRect()

        this.sizes = event.sizes

        this.gallerySizes = {
            height: this.galleryBounds.height / window.innerHeight * this.sizes.height,
            width: this.galleryBounds.width / window.innerWidth * this.sizes.width
        }

        this.sizes.y = this.scroll.target = 0

        map(this.medias, media => media.onResize(event))

        if (this.isPreloaderActive) {
            // Recalculate init position with fresh bounds from media.onResize
            this.setInitPosition()
        } else {
            this.scroll.current = this.scroll.last = savedScroll
        }
    }



    onWheel({ pixelY }) {
        this.scroll.target += (pixelY * 1.6)

        if (this.isPreloaderActive) {
            this.scroll.target = Math.max(this.preloaderInitScroll, this.scroll.target)
            return
        }

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

    animateToCase(mediaIndex, targetBounds, sizes, onComplete) {
        const media = this.medias[mediaIndex]

        if (!media) {
            onComplete?.()
            return
        }

        media.isTransitioning = true
        media.material.uniforms.uNormalizedY.value = 0

        const tl = gsap.timeline({ onComplete })

        // Flip: top goes to bottom, front face goes to back (180° around X axis)
        tl.to(media.mesh.rotation, {
            x: Math.PI,
            duration: 0.55,
            ease: 'power2.inOut'
        }, 0)

        // Bow the centre toward the viewer on the way up, relax on the way down
        tl.to(media.material.uniforms.uFlipCurve, {
            value: 1, duration: 0.275, ease: 'power2.out'
        }, 0)
        tl.to(media.material.uniforms.uFlipCurve, {
            value: 0, duration: 0.275, ease: 'power2.in'
        }, 0.275)

        // After flip completes, scale and fly to the case banner bounds
        if (targetBounds && sizes) {
            const targetScaleX = (targetBounds.width / window.innerWidth) * sizes.width
            const targetScaleY = (targetBounds.height / window.innerHeight) * sizes.height
            const targetX = (-sizes.width / 2) + (targetScaleX / 2) + (targetBounds.left / window.innerWidth) * sizes.width
            const targetY = (sizes.height / 2) - (targetScaleY / 2) - (targetBounds.top / window.innerHeight) * sizes.height

            tl.to(media.mesh.scale, {
                x: targetScaleX,
                y: targetScaleY,
                duration: 0.65,
                ease: 'power3.inOut',
                onUpdate: () => {
                    media.material.uniforms.uPlaneSizes.value.set(
                        media.mesh.scale.x,
                        media.mesh.scale.y
                    )
                }
            }, 0.5)

            tl.to(media.mesh.position, {
                x: targetX,
                y: targetY,
                duration: 0.65,
                ease: 'power3.inOut'
            }, 0.5)
        }
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

        if (this.isPreloaderActive && this.homePreloader) {
            const delta = this.scroll.current - this.preloaderInitScroll

            const progress = Math.max(0, Math.min(1, delta / window.innerHeight))
            const yPercent = progress * 100

            map(this.animations, animation => {
                const spans = animation.element.querySelectorAll('span span')
                gsap.set(spans, { y: `${-yPercent}%` })
            })


            if (delta >= window.innerHeight) {
                this.medias[this.medias.length - 1].mesh.visible = true
                this.mediasElements[this.mediasElements.length - 1].style.opacity = 1

                this.homePreloader.remove()
                this.isPreloaderActive = false
                this.snapToNearest()
            }
        }

        if (this.medias && this.gallerySizes) {
            const direction = this.scroll.current > this.scroll.last ? 'up' : 'down'

            map(this.medias, media => {
                if (media.isTransitioning) return

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

                const R = 2000
                const extraYPx = -(media.extra.y * (window.innerHeight / this.sizes.height))
                const visualCenterY = media.bounds.top + media.bounds.height / 2 - this.scroll.current + extraYPx
                const d = visualCenterY - window.innerHeight / 2
                const theta = Math.asin(Math.max(-1, Math.min(1, d / R)))
                const xOffset = R * (Math.cos(theta) - 1)

                const normalizedY = Math.max(-1, Math.min(1, d / R))
                const scrollNY = Math.max(-1, Math.min(1, d / window.innerHeight))
                media.update(this.scroll.current, xOffset, theta, normalizedY, scrollNY)

                if (device.isTouch && media.mobileNameEl) {
                    const absDist = Math.abs(d) / window.innerHeight
                    media.mobileNameEl.style.opacity = Math.max(0, 1 - absDist * 2.5)
                }
            })
        }

        this.scroll.last = this.scroll.current
    }

    destroy() {
        this.scene.remove(this.group)
    }
}