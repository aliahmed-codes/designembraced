import * as THREE from "three"
import { map } from "lodash"
import Prefix from 'prefix'

import Media from "./Media"

export default class Case {
    constructor({ scene, sizes }) {

        this.group = new THREE.Group()
        this.textureLoader = new THREE.TextureLoader()
        this.textureLoader.crossOrigin = 'anonymous'

        this.scene = scene
        this.sizes = sizes

        this.mediasElements = document.querySelectorAll('.case_gallery_link_wrapper')


        this.createGeometry()
        this.createMedias()

        this.scroll = {
            target: 0,
        }

        this.scene.add(this.group)

        this.transformPrefix = Prefix('transform')
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
                textureLoader: this.textureLoader
            })
        })
    }



    onResize(event) {


    }



    onWheel({ pixelX, pixelY }) {
        this.scroll.target += pixelY
    }


    update() { }

    destroy() {
        this.scene.remove(this.group)
    }
}