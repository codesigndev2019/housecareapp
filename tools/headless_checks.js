const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const report = { console: [], pageErrors: [], actions: [] };
  const tmp = path.resolve(__dirname,'tmp');
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });

  // create two small binary images (1x1 png/jpg) from base64
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn8B9o1sXrUAAAAASUVORK5CYII=';
  const jpgBase64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUTEhIVFhUVFhUVFRUVFRUVFRUXFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lICYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAJ8BPgMBIgACEQEDEQH/xAAXAAEBAQEAAAAAAAAAAAAAAAABAgME/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAEF/9oADAMBAAIQAxAAAAH5f//EABoQAQEBAQEBAQAAAAAAAAAAAAERAhAhMVH/2gAIAQEAAT8Ax0k4z8s0M6JDAG9m2kQDJ6r0n/8QAFhEBAQEAAAAAAAAAAAAAAAAAAQAR/9oACAECAQE/AL//xAAXEQEBAQEAAAAAAAAAAAAAAAABABEh/9oACAEDAQE/AL//2Q==';

  fs.writeFileSync(path.join(tmp,'img1.png'), Buffer.from(pngBase64,'base64'));
  fs.writeFileSync(path.join(tmp,'img2.jpg'), Buffer.from(jpgBase64,'base64'));
  fs.writeFileSync(path.join(tmp,'bad.txt'), 'not-an-image');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    report.console.push({ type: msg.type(), text: msg.text(), location: msg.location() });
  });

  page.on('pageerror', err => {
    report.pageErrors.push({ message: err.message, stack: err.stack });
  });

  try {
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle', timeout: 10000 });
    report.actions.push('Loaded root');

    // navigate to recipes
    await page.click('a[routerlink="/app/recipes"], a[routerLink="/app/recipes"], a:has-text("Recetas"), a:has-text("Recipes")', { timeout: 3000 }).catch(()=>{});
    await page.waitForTimeout(600);
    report.actions.push('Navigated to recipes');

    // open add dialog
    await page.click('.add-btn', { timeout: 2000 }).catch(()=>{});
    await page.waitForTimeout(300);
    report.actions.push('Opened add recipe dialog');

    // try submit empty form to trigger validation
    await page.click('button:has-text("Guardar"), button:has-text("Save"), button[mat-raised-button][color="primary"]');
    await page.waitForTimeout(300);
    report.actions.push('Attempted to save empty form');

    // upload 3 files (2 valid + 1 invalid) to check validation
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles([
        path.join(tmp,'img1.png'),
        path.join(tmp,'img2.jpg'),
        path.join(tmp,'bad.txt')
      ]);
      report.actions.push('Uploaded 3 files to the file input');
      await page.waitForTimeout(500);
    } else {
      report.actions.push('file input not found');
    }

    // toggle schedule and pick a date
    const toggle = await page.$('mat-slide-toggle');
    if (toggle) {
      await toggle.click();
      report.actions.push('Toggled schedule');
      // fill date
      const dateInput = await page.$('input[formcontrolname="scheduledAt"], input[type="date"]');
      if (dateInput) {
        await dateInput.fill('2026-02-14');
        report.actions.push('Filled scheduled date');
      }
    }

    // close dialog
    await page.click('button:has-text("Cancelar"), button:has-text("Cancel")').catch(()=>{});
    report.actions.push('Closed dialog');

    // open catalogs and open history dialog
    await page.click('a[routerLink="/app/catalogs"], a:has-text("Catálogos"), a:has-text("Catalogs")').catch(()=>{});
    await page.waitForTimeout(500);
    await page.click('.history-btn').catch(()=>{});
    report.actions.push('Opened history dialog');
    await page.waitForTimeout(600);

    // Scroll history dialog horizontally to check layout
    await page.evaluate(() => { const el = document.querySelector('.history-card .table-wrap'); if (el) el.scrollLeft = 100; });
    report.actions.push('Scrolled history dialog table-wrap if present');

  } catch (err) {
    report.pageErrors.push({ message: 'Script error: '+err.message, stack: err.stack });
  }

  await browser.close();

  const out = path.resolve(__dirname,'headless-report.json');
  fs.writeFileSync(out, JSON.stringify(report,null,2));
  console.log('Headless check complete. Report written to', out);
  console.log('Summary: actions:', report.actions.length, 'console messages:', report.console.length, 'pageErrors:', report.pageErrors.length);
})();