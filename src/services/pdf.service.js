const fs = require('fs');
const pdf = require('pdf-parse');
const { parseEFakturText } = require('../utils/parser.util'); 


/**
 * Extracts and parses data from a PDF file at the specified path.
 * Reads the PDF file, extracts its text content, and processes it using the EFaktur text parser utility.
 *
 * @param {string} path - The file system path to the PDF file to be processed.
 * @returns {Promise<Object>} The parsed data extracted from the PDF, as returned by the EFaktur text parser.
 */
exports.extractDataFromPDF = async (path) => {
  const dataBuffer = fs.readFileSync(path);
  const text = await pdf(dataBuffer);
  console.log('PDF Text:\n', text.text);

  return parseEFakturText(text.text, 'pdf');
};
