const path = require('path');
const {Jimp} = require('jimp');
const jsQR = require('jsqr');
const puppeteer = require('puppeteer');

/**
 * QR Code Service
 * This service handles the conversion of PDF files to images and reads QR codes from images.
 */
exports.getQRCodeURL = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  let imagePath;

  if (ext === '.pdf') {
    imagePath = await convertPDFToImage(filePath);
  } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
    imagePath = filePath;
  } else {
    throw new Error('Unsupported file type for QR reading');
  }

  return await readQRFromImage(imagePath);
};


async function convertPDFToImage(pdfPath) {
  const outputDir = path.resolve(__dirname, '../../storages');

  const outputPrefix = 'page';
  const outputPath = path.join(outputDir, `${outputPrefix}-1.jpg`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const absolutePdfPath = path.resolve(pdfPath);
  await page.goto(`file://${absolutePdfPath}`, { waitUntil: 'networkidle0' });

  await page.screenshot({ path: outputPath, fullPage: true });

  await browser.close();
  console.log('PDF conversion complete');
  return outputPath;
}

async function readQRFromImage(imagePath) {
  const image = await Jimp.read(imagePath);
  const { data, width, height } = image.bitmap;
  const qrCode = jsQR(new Uint8ClampedArray(data), width, height);

  if (!qrCode) throw new Error('QR code not found in image');
  return qrCode.data;
}