const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  await page.goto(`file://${process.cwd()}/perf-test.html`, { waitUntil: 'networkidle0' });

  // get results
  const result = await page.evaluate(() => {
     return {
         original: window.originalTime,
         optimized: window.optimizedTime
     };
  });
  console.log(result);
  await browser.close();
})();
