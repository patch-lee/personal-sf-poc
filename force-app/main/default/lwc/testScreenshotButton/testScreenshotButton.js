import { api, LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
// import jsPDFLib from '@salesforce/resourceUrl/jsPDF'
import html2canvasLib from '@salesforce/resourceUrl/html2canvas'
// import htmlToImageLib from '@salesforce/resourceUrl/htmlToImage'

export default class TestScreenshotButton extends LightningElement {
    @api captureClicked = () => {}
    scriptsLoaded = false

    renderedCallback() {
        if (this.scriptsLoaded) {
            console.log('return nothing')
            return;
        }

        this.loadAllScripts()

    }

    loadAllScripts = async () => {
        try {
            // await loadScript(this, jsPDFLib + '/jspdf.min.js')
            await loadScript(this, html2canvasLib + '/html2canvas.min.js')
            // await loadScript(this, htmlToImageLib + '/html-to-image.min.js')
            this.scriptsLoaded = true
        } catch (error) {
            console.log(error)
        }

    }

    async captureAsImage () {
        try {

            const captureElement = this.querySelector('.container')
            const outputElement = this.querySelector('.output')

            const jsElement = this.querySelector('#container')
            console.log(jsElement)

            if (jsElement) {
                const imageDataUrl = await html2canvas(captureElement)
                console.log(imageDataUrl)
                this.captureClicked(imageDataUrl)
    
                // const img = new Image();
                // img.src = imageDataUrl;
    
                // outputElement.appendChild(img);
            }
            

            // const { jsPDF } = window.jspdf;

            // var doc = new jsPDF();

            // doc.html(jsElement, {
            //     callback: function (doc) {
            //         doc.save();
            //     }
            // });

            // captureElement.appendChild(jsElement)

            // console.log(captureElement)
            // console.log(jsElement)
            // console.log(outputElement)

            // console.log(this.template)
            // const canvas = await html2canvas(this.template.querySelector('.container'))

            // console.log(canvas)
            // outputElement.replaceChild(jsElement)
            // outputElement.appendChild(canvas1)
        } catch (error) {
            console.log(error)
        }
    }
}