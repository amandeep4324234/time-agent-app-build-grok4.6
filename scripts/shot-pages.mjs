import { chromium } from "playwright";

const pages = [
  ["/", "landing"],
  ["/app?day=2026-08-27", "app-aug27"],
  ["/week", "week"],
  ["/block", "block"],
  ["/onboarding", "onboarding"],
  ["/checkout", "checkout"],
  ["/debrief", "debrief"],
];

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.log("CONSOLE", m.text());
});

for (const [path, name] of pages) {
  await page.goto("http://127.0.0.1:8080" + path, {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  await page.waitForTimeout(500);
  const body = await page.locator("body").innerText();
  console.log("===", name, "len", body.length, "===");
  console.log(body.slice(0, 500).replace(/\n/g, " | "));
  await page.screenshot({
    path: `/workspace/screenshots/${name}.png`,
    fullPage: false,
  });
}

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
});
const mp = await mobile.newPage();
await mp.goto("http://127.0.0.1:8080/app?day=2026-08-27", {
  waitUntil: "networkidle",
});
await mp.waitForTimeout(500);
await mp.screenshot({ path: "/workspace/screenshots/app-mobile.png" });
await mp.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await mp.waitForTimeout(400);
await mp.screenshot({ path: "/workspace/screenshots/landing-mobile.png" });
await browser.close();
console.log("done");
