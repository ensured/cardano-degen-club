"use server"

import puppeteer from "puppeteer"

async function scrape() {
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 80,
    args: ["--window-size=1920,1080"],
  })

  const page = await browser.newPage()

  await page.goto("https://www.google.com")
  await page.type('[name="q"]', "puppeteer")
  await page.keyboard.press("Enter")
  console.log("Done.")
}

scrape()
