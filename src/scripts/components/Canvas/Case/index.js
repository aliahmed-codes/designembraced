import * as THREE from "three"
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
        map(this.medias, media => media.createBounds({ sizes: this.sizes }))
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

    onResize(event) {
        this.sizes = event.sizes
        map(this.medias, media => media.onResize(event))
    }

    update(scroll) {
        if (!scroll) return
        map(this.medias, media => media.update(scroll.current))
    }

    destroy() {
        this.scene.remove(this.group)
    }
}
