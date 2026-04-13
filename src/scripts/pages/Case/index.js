import Page from "../../classes/Page";

export default class Case extends Page {
    constructor() {
        super({
            id: "case",
            element: ".case",
            elements: {
                wrapper: '.case_wrapper'
            }
        })

    }
}