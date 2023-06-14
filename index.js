
const puppeteer = require("puppeteer")
const express = require("express")
const app = express();
const PORT = process.env.PORT || 4000;
require("dotenv").config();
// app.use(cors());
// if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
//     chrome = require("chrome-aws-lambda");
//     puppeteer = require("puppeteer-core");
// }


app.get("/", async (req, res) => {

    // let options = {};

    // if (process.env_AWS_LAMBDA_FUNCTION_VERSION) {
    //     options = {
    //         args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
    //         defaultViewport: chrome.defaultViewport,
    //         executablePath: await chrome.executablePath,
    //         headless: true,
    //         ignoreHTTPSErrors: true,
    //     };
    // }


    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disabe-setuid-sandbox',
            '--single-process',
            '--no-zygote'
        ],
        ececutablePath: process.env.NODE_ENV === 'production' ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),

    });

    try {
        const page = await browser.newPage();

        await page.goto("https://logigames.bet9ja.com/Games/Launcher?gameId=11000&provider=0&pff=1&skin=201");

        const html1 = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.balls span'), (e) => e.innerText)
        );

        const html2 = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.statistics > tbody > tr > td'), (e) => e.textContent)
        );

        const data = {
            balls: html1,
            statistics: html2
        };
        console.log(data)
        res.status(200).json(data);
    } catch (e) {
        console.error(e)
        res.send(`something went wrong while running Puppeteer: ${e}`)
    } finally {
        await browser.close();
    }

})





app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

module.exports = app;