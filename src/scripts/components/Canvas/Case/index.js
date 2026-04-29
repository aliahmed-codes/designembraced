import * as THREE from "three"
import gsap from "gsap"
import { map } from "lodash"

import Media from "./Media"

export default class Case {
    constructor({ scene, sizes }) {

        this.group = new THREE.Group()
        this.textureLoader = new THREE.TextureLoader()
        this.textureLoader.crossOrigin = 'anonymous'

        this.scene = scene
        this.sizes = sizes

        this.caseBannerImage = document.querySelector('#case_banner_media img')
        this.caseNextBannerImage = document.querySelector('#case_next_banner_media img')
        this.caseMediaImages = document.querySelectorAll('.case_media_media img')
        this.caseMediaVideos = document.querySelectorAll('video.case_media_media')
        this.mediasElements = [
            this.caseBannerImage,
            this.caseNextBannerImage,
            ...this.caseMediaImages,
            ...(this.caseMediaVideos || [])
        ].filter(element => element !== null);
        this.bannerSet = new Set([this.caseBannerImage, this.caseNextBannerImage])

        this.createGeometry()
        this.createMedias()

        this.scene.add(this.group)
    }

    createGeometry() {
        this.geometry = new THREE.PlaneGeometry(1, 1, 30, 30)
    }

    createMedias() {
        this.medias = map(this.mediasElements, (element, index) => {
            return new Media({
                element,
                index,
                scene: this.group,
                sizes: this.sizes,
                geometry: this.geometry,
                textureLoader: this.textureLoader,
                foldEnabled: !this.bannerSet.has(element),
                onVideoReady: () => this.recaptureAllBounds()
            })
        })
    }

    recaptureAllBounds() {
        const scroll = this._currentScroll || 0
        map(this.medias, media => media.createBounds({ sizes: this.sizes, currentScroll: scroll }))
    }


    /**
         * Animations.
         */

    show() {

        console.log('canvas case show');

        map(this.medias, (media) => media.show());
    }

    hide() {
        console.log('canvas case show');

        map(this.medias, (media) => media.hide());
    }

    /**
     * Events.
     */

    animateToBounds(mediaIndex, targetBounds, sizes, onComplete) {
        const media = this.medias[mediaIndex]

        if (!media || !targetBounds) {
            onComplete?.()
            return
        }

        media.isTransitioning = true
        media.material.uniforms.uProgress.value = 0

        const targetScaleX = (targetBounds.width / window.innerWidth) * sizes.width
        const targetScaleY = (targetBounds.height / window.innerHeight) * sizes.height
        const targetX = (-sizes.width / 2) + (targetScaleX / 2) + (targetBounds.left / window.innerWidth) * sizes.width
        const targetY = (sizes.height / 2) - (targetScaleY / 2) - (targetBounds.top / window.innerHeight) * sizes.height

        const tl = gsap.timeline({
            onComplete: () => {
                media.isTransitioning = false
                onComplete?.()
            }
        })

        // Phase 1 — page flip
        tl.to(media.material.uniforms.uProgress, {
            value: 1,
            duration: 1.5,
            ease: 'none'
        }, 0)


        // Position flies to gallery slot
        tl.to(media.mesh.position, {
            x: targetX,
            y: targetY,
            duration: 1,
            ease: 'none'
        }, 0.2)

        // Scale shrinks to gallery size
        tl.to(media.mesh.scale, {
            x: targetScaleX,
            y: targetScaleY,
            duration: 1,
            ease: 'none',
            onUpdate: () => {
                media.material.uniforms.uPlaneSizes.value.set(
                    media.mesh.scale.x,
                    media.mesh.scale.y
                )
            }
        }, 0.4)
    }

    onResize(event) {
        this.sizes = event.sizes
        const scroll = this._currentScroll || 0
        map(this.medias, media => media.onResize({ ...event, currentScroll: scroll }))
    }

    // Called each frame by app.js; nextProgress (0–1) is set externally by app.js
    update(scroll) {
        if (!scroll) return
        this._currentScroll = scroll.current

        const t = performance.now() / 1000
        const next = this.nextProgress || 0

        map(this.medias, (media, index) => {
            if (media.isTransitioning) return

            // Index 1 = next-project banner: drive it toward the hero position during scroll transition
            if (index === 1 && next > 0) {
                if (!this._nextStart) this._captureNextState(media, scroll.current, t)
                this._driveNextBanner(media, next)
                return
            }

            media.update(scroll.current, t)
        })

        // Reset captured start state if transition was cancelled
        if (next <= 0 && this._nextStart) {
            this._nextStart = null
            this._nextTarget = null
        }
    }

    _captureNextState(media, scrollY, t) {
        // Run a normal update to get the correct current position
        media.update(scrollY, t)

        this._nextStart = {
            scaleX: media.mesh.scale.x,
            scaleY: media.mesh.scale.y,
            posX: media.mesh.position.x,
            posY: media.mesh.position.y,
        }

        // Target = where medias[0] (hero banner) sits at scroll 0
        const hero = this.medias[0]
        if (!hero) return
        const sw = (hero.bounds.width / window.innerWidth) * this.sizes.width
        const sh = (hero.bounds.height / window.innerHeight) * this.sizes.height
        this._nextTarget = {
            scaleX: sw,
            scaleY: sh,
            posX: (-this.sizes.width / 2) + (sw / 2) + (hero.bounds.left / window.innerWidth) * this.sizes.width,
            posY: (this.sizes.height / 2) - (sh / 2) - (hero.bounds.top / window.innerHeight) * this.sizes.height,
        }
    }

    _driveNextBanner(media, progress) {
        if (!this._nextStart || !this._nextTarget) return

        // Smoothstep for a softer feel
        const t = progress * progress * (3 - 2 * progress)

        media.mesh.scale.x = this._nextStart.scaleX + (this._nextTarget.scaleX - this._nextStart.scaleX) * t
        media.mesh.scale.y = this._nextStart.scaleY + (this._nextTarget.scaleY - this._nextStart.scaleY) * t
        media.mesh.position.x = this._nextStart.posX + (this._nextTarget.posX - this._nextStart.posX) * t
        media.mesh.position.y = this._nextStart.posY + (this._nextTarget.posY - this._nextStart.posY) * t
        media.material.uniforms.uPlaneSizes.value.set(media.mesh.scale.x, media.mesh.scale.y)
    }

    destroy() {
        this.scene.remove(this.group)
    }
}
