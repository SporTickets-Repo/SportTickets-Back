import puppeteer from 'puppeteer';
import * as QRCode from 'qrcode';

export function generateRandomCode(length = 5): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function generatePdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: process.env.CHROME_BIN || '/app/.apt/usr/bin/google-chrome',
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.emulateMediaType('screen');
  const pdfUint8Array = await page.pdf({
    format: 'A4',
    printBackground: true,
  });
  await browser.close();
  return Buffer.from(pdfUint8Array);
}

export async function generateQrCodeBase64(content: string): Promise<string> {
  const dataUrl = await QRCode.toDataURL(content);
  return dataUrl;
}
