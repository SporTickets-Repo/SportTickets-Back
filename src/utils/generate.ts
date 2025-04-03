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

export async function generateQrCodeBase64(text: string): Promise<string> {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300,
  });
}

export async function generatePdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.emulateMediaType('screen');
  const pdfUint8Array = await page.pdf({
    format: 'A4',
    printBackground: true,
  });
  await browser.close();
  const pdfBuffer = Buffer.from(pdfUint8Array);
  return pdfBuffer;
}
