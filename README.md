
# E-Faktur API Validation Service

This Node.js microservice validates Indonesian e-Faktur files (PDF or JPG) by extracting structured invoice fields and comparing them with official tax data retrieved from the DJP (Direktorat Jenderal Pajak) via the QR code in the document.

---

## 🚀 Features

- Accepts `PDF` or `JPG` e-Faktur uploads
- Extracts fields using:
  - OCR for scanned/image-based documents
  - Text parsing for text-based PDFs
- Decodes QR code (PDF or image)
- Fetches DJP data via QR URL
- Compares document data with DJP response
- Returns a structured validation report

---

## 🛠 Tech Stack

- **Node.js**, **Express**
- `multer` – file uploads
- `puppeteer` – convert PDF to image for QR scanning
- `tesseract.js` – OCR for image-based files
- `pdf-parse` – parse text-based PDFs
- `jsQR`, `jimp` – QR code decoding
- `axios` – HTTP calls to DJP
- `fast-xml-parser` – parse XML response

---

## 📦 Installation

```bash
git clone https://github.com/your-username/efaktur-validator.git
cd efaktur-validator
npm install
```

> ✅ No native dependencies required — Puppeteer handles PDF rendering internally.

---

## 🚦 Usage

### Start server

```bash
npm start
```

### Endpoint

**POST** `/validate-efaktur`  
Accepts `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file  | File (`.pdf` or `.jpg`) | ✅ | The e-Faktur document |

#### Example using cURL

```bash
curl -X POST http://localhost:3000/validate-efaktur   -F 'file=@./samples/contoh_faktur_pajak.pdf'
```

---

## ✅ Sample Response

```json
{
  "status": "validated_successfully",
  "message": "Validation complete",
  "validation_results": {
    "deviations": [],
    "validated_data": {
      "nomorFaktur": "0700002212345678",
      "tanggalFaktur": "01/04/2022",
      "npwpPenjual": "012345678012000",
      "namaPenjual": "PT ABC",
      "npwpPembeli": "023456789217000",
      "namaPembeli": "PT XYZ",
      "jumlahDpp": "15000000",
      "jumlahPpn": "1650000"
    }
  }
}
```

If mismatches are found:

```json
{
  "status": "validated_with_deviations",
  "validation_results": {
    "deviations": [
      {
        "field": "namaPembeli",
        "pdf_value": "PT XYZ",
        "djp_api_value": "PT ABC",
        "deviation_type": "mismatch"
      }
    ]
  }
}
```

---

## 📁 Project Structure

```
src/
│
├── app.js
├── routes/
│   └── validate.route.js
├── controllers/
│   └── validate.controller.js
├── services/
│   ├── pdf.service.js
│   ├── jpg.service.js
│   ├── qr.service.js      ← uses puppeteer
│   └── djp.service.js
└── utils/
    └── compare.util.js
storages/                  ← stroge the uploaded files
samples/                   ← pdf and image faktur samples
```

---

## 📄 License

MIT – For demonstration and evaluation purposes only. Built for the OnlinePajak coding challenge.
