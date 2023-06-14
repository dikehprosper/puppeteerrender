
const puppeteer = require("puppeteer")
const express = require("express")
const app = express();
const PORT = process.env.PORT || 4000;
require("dotenv").config();
const fs = require("fs");



// Countdown section
let count = 49;
let activeButton = 0;
let interval;

function startCountdown() {
    interval = setInterval(() => {
        console.log(count);
        if (count > 0) {
            count--;
            activeButton++;
        } else {
            clearInterval(interval);
            restartCountdown();
        }
    }, 1000);
}

function restartCountdown() {
    count = 49;
    activeButton = 4;
    startCountdown(); // Start the countdown again
}

// Start the countdown when the server starts
startCountdown();

const intervalInMilliseconds = 1000; // 7 seconds
// Read the current data from scraped-data.json


async function scrapeAndStoreData() {
    if (count === 6) {
        try {

            const browser = await puppeteer.launch({
                args: [
                    '--no-sandbox',
                    '--disabe-setuid-sandbox',
                    '--single-process',
                    '--no-zygote'
                ],
                executablePath: process.env.NODE_ENV === 'production' ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),

            });
            const page = await browser.newPage();

            await page.goto("https://logigames.bet9ja.com/Games/Launcher?gameId=11000&provider=0&pff=1&skin=201");

            const html1 = await page.evaluate(() =>
                Array.from(document.querySelectorAll('.statistics > tbody >  tr > td > .balls > span'), (e) => e.innerText)
            );

            const html2 = await page.evaluate(() =>
                Array.from(document.querySelectorAll('.statistics > tbody > tr > td'), (e) => e.textContent)
            );

            const data = {
                balls: html1,
                statistics: html2
            };
            const jsonData = JSON.stringify(data);

            // Check if the newly scraped data is different from the previous data
        
            if (jsonData) {
                fs.writeFile("scraped-data.json", jsonData, (err) => {
                    if (err) {
                        console.error("An error occurred while writing the file:", err);
                    } else {
                        console.log("Data scraped and stored successfully!");
                        // Update the previousData variable with the new data
                    }
                });
            } else {
                console.log("Data is the same!");
            }
        } catch (e) {
            console.error(e)
            res.send(`something went wrong while running Puppeteer: ${e}`)
        }
    }
}


// Run the scraping and storing process initially
scrapeAndStoreData();

// Schedule the scraping and storing process to run every 7 seconds
setInterval(scrapeAndStoreData, intervalInMilliseconds);


app.get("/FETCH-DATA", (req, res) => {
    fs.readFile("scraped-data.json", (err, data) => {
        if (err) {
            console.error("An error occurred while reading the file:", err);
            res.status(500).send("An error occurred while fetching the data.");
        } else {
            const jsonData = JSON.parse(data);
            res.status(200).json(jsonData);
        }
    });
});


app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

module.exports = app;



