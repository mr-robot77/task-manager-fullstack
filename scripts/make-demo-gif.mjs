#!/usr/bin/env node
/**
 * Generates a demo GIF by capturing screenshots of the running app.
 * Run: npm run make-demo-gif (app must be running on BASE_URL)
 */
import { chromium } from 'playwright';
import { mkdirSync, rmSync, createWriteStream } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const GIFEncoder = require('gifencoder');
const pngFileStream = require('png-file-stream');

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BASE_URL = process.env.BASE_URL || 'http://localhost:4200';
const PAGES = ['/dashboard', '/tasks', '/equipment'];
const VIEWPORT = { width: 1280, height: 720 };
const FRAME_DELAY_MS = 800;
const TEMP_DIR = join(ROOT, '.demo-gif-temp');
const OUT_FILE = join(ROOT, 'assets', 'demo.gif');

async function main() {
  console.log('Demo GIF capture — Base URL:', BASE_URL);

  mkdirSync(TEMP_DIR, { recursive: true });
  mkdirSync(join(ROOT, 'assets'), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    ignoreHTTPSErrors: true,
  });

  try {
    const page = await context.newPage();

    for (let i = 0; i < PAGES.length; i++) {
      const path = PAGES[i];
      const url = BASE_URL + path;
      const fp = join(TEMP_DIR, `frame${String(i).padStart(2, '0')}.png`);
      console.log('Capturing', url);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: fp, type: 'png' });
    }

    await browser.close();

    const globPattern = join(TEMP_DIR, 'frame*.png').replace(/\\/g, '/');
    const encoder = new GIFEncoder(VIEWPORT.width, VIEWPORT.height);

    await new Promise((resolve, reject) => {
      pngFileStream(globPattern)
        .pipe(encoder.createWriteStream({ repeat: 0, delay: FRAME_DELAY_MS, quality: 10 }))
        .pipe(createWriteStream(OUT_FILE))
        .on('finish', resolve)
        .on('error', reject);
    });

    console.log('GIF saved to', OUT_FILE);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    try {
      rmSync(TEMP_DIR, { recursive: true });
    } catch {}
  }
}

main();
