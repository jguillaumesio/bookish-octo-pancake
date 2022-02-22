import puppeteer from "puppeteer-extra";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";

export class PuppeteerManager{

    static

    async constructor() {
        this.pages = [];
        puppeteer.use(AdblockerPlugin())
        this.browser = await puppeteer.launch({
            headless: false
        });
    }

    async newPage(url, downloadPath) {
        const page = await this.browser.newPage();
        await page.client().send('Browser.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: downloadPath
        });
        await page.goto(url);
        this.pages.push(page);
        return page;
    }

    leavePage(url){

    }
}