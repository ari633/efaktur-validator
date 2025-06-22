const path = require('path');
const { extractDataFromPDF } = require('../services/pdf.service');
const { extractDataFromJPG } = require('../services/jpg.service');
const { getQRCodeURL } = require('../services/qr.service');
const { fetchDJPData } = require('../services/djp.service');
const { compareData } = require('../utils/compare.util');

exports.validateEfactur = async (req, res) => {
  try {
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let extractedData;

    if (ext === '.pdf') {
      extractedData = await extractDataFromPDF(filePath);
    } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      extractedData = await extractDataFromJPG(filePath);
    } else {
      return res.status(400).json({ status: 'error', message: 'Unsupported file type' });
    }
    
    const qrURL = await getQRCodeURL(filePath);
    console.log('QR Code URL:', qrURL);
    const djpData = await fetchDJPData(qrURL);
    console.log('DJP Data:', djpData);
    console.log('Extracted Data:', extractedData);
    const result = compareData(extractedData, djpData);

    //console.log('Validation Result:', result);
    res.json({
      status: result.deviations.length > 0 ? 'validated_with_deviations' : 'validated_successfully',
      message: 'Validation complete',
      validation_results: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
