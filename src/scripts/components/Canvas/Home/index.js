import * as THREE from "three"
import { map } from "lodash"

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
}