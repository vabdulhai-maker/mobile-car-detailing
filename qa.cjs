const {chromium} = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  fs.mkdirSync('qa', {recursive:true});
  const browser = await chromium.launch({...(process.env.PLAYWRIGHT_CHROME_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_CHROME_EXECUTABLE} : {}),headless:true});
  const results = [];
  try {
    for (const width of [390,320,360,375,393,412,430,768,1440]) {
      const context = await browser.newContext({viewport:{width,height:width >= 900 ? 1000 : 844},isMobile:width < 600,hasTouch:width < 600,deviceScaleFactor:1,acceptDownloads:true});
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(process.env.QA_URL || 'http://127.0.0.1:4173',{waitUntil:'networkidle'});
      await page.locator('.hero-image img').evaluate(image => image.decode());
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,`Horizontal overflow at ${width}`);
      const anchors = await page.locator('a[href^="#"]').evaluateAll(links => links.filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash));
      assert.deepEqual(anchors, [], 'Broken navigation anchor');
      for (const section of ['#services','#packages','#gallery','#about','#reviews','#areas','#contact','.footer']) {
        await page.locator(section).scrollIntoViewIfNeeded();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,`${section} overflow at ${width}`);
      }
      if (width === 390 || width === 1440) {
        await page.evaluate(() => scrollTo(0,0));
        await page.waitForTimeout(500);
        await page.screenshot({path:`qa/home-${width}.png`});
        await page.screenshot({path:`qa/full-${width}.png`,fullPage:true});
      }
      if (width < 900) {
        await page.locator('#menu-open').click();
        await page.locator('#mobile-menu').getByRole('link',{name:'Packages'}).click();
        await page.waitForFunction(() => !document.getElementById('mobile-menu').open);
        await page.locator('#menu-open').click();
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => document.getElementById('menu-open').getAttribute('aria-expanded') === 'false');
        assert.equal(await page.locator('#menu-open').getAttribute('aria-expanded'),'false');
      }
      await page.locator('[data-vehicle="SUV / Crossover"]').click();
      assert.equal(await page.locator('[data-price="149"]').textContent(),'$199');
      await page.locator('[data-vehicle="Sedan / Coupe"]').click();
      await page.locator('#compare-range').focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('#compare-range').inputValue(),'51');
      await page.locator('#gallery-toggle').click();
      assert.equal(await page.locator('#gallery-more').isVisible(),true);
      await page.locator('#gallery-toggle').click();
      await page.locator('[data-service="Interior Detail"]').click();
      await page.locator('#detail-book').click();
      assert.equal(await page.locator('input[value="Interior Detail"]').isChecked(),true);
      await page.locator('#booking-dialog [data-close]').click();
      await page.locator('.hero [data-book]').click();
      await page.locator('#booking-form button[type="submit"]').click();
      assert.match(await page.locator('#booking-error').textContent(),/choose a service/);
      await page.locator('input[value="Signature Detail"]').check();
      await page.locator('#booking-form button[type="submit"]').click();
      await page.locator('input[value="SUV / Crossover"]').check();
      await page.locator('#booking-form button[type="submit"]').click();
      await page.locator('input[value="Pet hair removal"]').check();
      await page.locator('#booking-form button[type="submit"]').click();
      await page.locator('#book-address').fill('123 Example Street');
      await page.locator('#book-zip').fill('78701');
      await page.locator('#booking-form button[type="submit"]').click();
      await page.locator('#book-date').fill('2027-06-15');
      await page.locator('#book-time').selectOption('10am – 12pm');
      await page.locator('#booking-form button[type="submit"]').click();
      await page.locator('#book-name').fill('Demo Visitor');
      await page.locator('#book-email').fill('demo@example.com');
      await page.locator('#book-phone').fill('5125550100');
      await page.locator('#booking-back').click();
      assert.equal(await page.locator('#book-date').inputValue(),'2027-06-15');
      await page.locator('#booking-form button[type="submit"]').click();
      assert.equal(await page.locator('#book-name').inputValue(),'Demo Visitor');
      await page.locator('#booking-form button[type="submit"]').click();
      assert.equal(await page.locator('.review-estimate strong').textContent(),'$384');
      const bounds = await page.locator('#booking-dialog').evaluate(element => ({width:element.clientWidth,scrollWidth:element.scrollWidth}));
      assert.ok(bounds.scrollWidth <= bounds.width,`Booking dialog overflow at ${width}`);
      if (width === 390) await page.screenshot({path:'qa/booking-390.png'});
      await page.locator('input[name="consent"]').check();
      await page.locator('#booking-form button[type="submit"]').click();
      assert.match(await page.locator('#booking-title').textContent(),/saved/);
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#download-request').click();
      const download = await downloadPromise;
      assert.equal(download.suggestedFilename(),'atelier-demo-request.txt');
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('atelier-demo-request')));
      assert.equal(saved.estimatedPrice,384);
      assert.equal(saved.demo,true);
      await page.locator('#finish-booking').click();
      await page.locator('#contact-name').fill('Demo Visitor');
      await page.locator('#contact-email').fill('demo@example.com');
      await page.locator('#contact-message').fill('Example message for testing.');
      await page.locator('#contact-form button').click();
      assert.match(await page.locator('.form-status').textContent(),/Nothing was sent/);
      await page.locator('#privacy-open').click();
      await page.locator('#clear-data').click();
      assert.equal(await page.evaluate(() => localStorage.getItem('atelier-demo-request')),null);
      await page.locator('#info-dialog [data-close]').click();
      const images = await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src));
      assert.deepEqual(images,[],'Image load failure');
      assert.deepEqual(errors,[],'Browser runtime errors');
      results.push({width,status:'passed',checks:['no page overflow','section navigation','vehicle pricing','gallery controls','service details','seven booking steps','required fields','back preservation','estimate','request download','contact form','data deletion','image loading','no JS errors']});
      console.log(`${width}px: passed`);
      await context.close();
    }
    fs.writeFileSync('qa/results.json',JSON.stringify({browser:'Headless Chrome, Windows; mobile viewport and touch emulation',realDevicesTested:false,results},null,2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error);process.exit(1); });
