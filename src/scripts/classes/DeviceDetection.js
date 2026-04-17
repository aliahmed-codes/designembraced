const breakpoints = {
    small: 425,
    phone: 768,
    tablet: 1024,
    desktop: 1920,
}

class DeviceDetection {

    constructor() {
        this.update()
    }


    update() {
        this.width = window.innerWidth

        this.isSmall = this.width <= breakpoints.small
        this.isPhone = this.width > breakpoints.small && this.width <= breakpoints.phone
        this.isTablet = this.width > breakpoints.phone && this.width <= breakpoints.tablet
        this.isDesktop = this.width > breakpoints.tablet && this.width <= breakpoints.desktop
        this.isWide = this.width > breakpoints.desktop

        this.isMobile = this.isSmall || this.isPhone
        this.isTouch = this.isMobile || this.isTablet
    }


    /**
     * Check if viewport is at least a given breakpoint (like SCSS ">=")
     */
    above(breakpoint) {
        return this.width > breakpoints[breakpoint]
    }


    /**
     * Check if viewport is below a given breakpoint (like SCSS "<")
     */
    below(breakpoint) {
        return this.width <= breakpoints[breakpoint]
    }


    /**
     * Check if viewport is between two breakpoints (like SCSS ">=phone" and "<tablet")
     */
    between(min, max) {
        return this.width > breakpoints[min] && this.width <= breakpoints[max]
    }

}

const device = new DeviceDetection()

export default device

