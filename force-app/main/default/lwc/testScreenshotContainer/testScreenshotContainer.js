import { api, LightningElement } from 'lwc';

export default class TestScreenshotContainer extends LightningElement {
    @api test

    testPrint() {
        console.log(this.test)
    }
}