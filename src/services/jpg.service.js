const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const { Jimp } = require("jimp");
const { parseEFakturText } = require('../utils/parser.util'); 

/**
 * Extracts and parses data from a JPG file at the specified path.
 * Reads the JPG file, processes it with Jimp for image manipulation,
 * and performs OCR using Tesseract.js to extract text content.
 *    
 * @param {string} filePath - The file system path to the JPG file to be processed.
 * @returns {Promise<Object>} The parsed data extracted from the JPG, as returned by the EFaktur text parser.
 */
exports.extractDataFromJPG = async (filePath) => {
  console.log('Extracting data from JPG:', filePath);
  if (!fs.existsSync(filePath)) throw new Error('File not found');

  const stats = fs.statSync(filePath);
  if (stats.size === 0) throw new Error('File is empty');

  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
    throw new Error(`Unsupported image type: ${ext}`);
  }

  const image = await Jimp.read(filePath);
  image.greyscale().contrast(0.5).normalize().write(filePath); 

  const {
    data: { text },
  } = await Tesseract.recognize(filePath, 'ind');

  console.log('OCR Text:\n', text);

  return parseEFakturText(text, 'jpg');
};
