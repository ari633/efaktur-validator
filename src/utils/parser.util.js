/**
 * Parses an e-Faktur (Indonesian tax invoice) text and extracts key information such as invoice number,
 * date, seller and buyer NPWP (tax ID), seller and buyer names, DPP (tax base), and PPN (VAT amount).
 *
 * @param {string} text - The raw text content of the e-Faktur to be parsed.
 * @returns {Object} An object containing the extracted e-Faktur details:
 * @returns {string} return.nomorFaktur - The invoice number.
 * @returns {string} return.tanggalFaktur - The invoice date.
 * @returns {string} return.npwpPenjual - The seller's NPWP (tax ID).
 * @returns {string} return.namaPenjual - The seller's name.
 * @returns {string} return.npwpPembeli - The buyer's NPWP (tax ID).
 * @returns {string} return.namaPembeli - The buyer's name.
 * @returns {string} return.jumlahDpp - The DPP (tax base) amount.
 * @returns {string} return.jumlahPpn - The PPN (VAT) amount.
 */
exports.parseEFakturText = (text, fromType) => {
  const normalize = (str) => str?.replace(/\s+/g, " ").trim();

  const nomorFaktur = (text.match(
    /Kode dan Nomor Seri Faktur Pajak\s*:\s*([0-9.\-]+)/i
  ) || [])[1];

  const npwpMatches = Array.from(text.matchAll(/NPWP\s*:\s*([0-9.\-]+)/gi));
  const npwpPenjual =
    fromType === "jpg" ? npwpMatches[0]?.[1] : npwpMatches[1]?.[0];
  const npwpPembeli =
    fromType === "jpg" ? npwpMatches[1]?.[1] : npwpMatches[0]?.[0];

  const namaMatches = Array.from(text.matchAll(/Nama\s*:\s*(.+)/gi));
  const namaPenjualMatched =
    fromType === "jpg"
      ? normalize(namaMatches[0]?.[1])
      : normalize(namaMatches[1]?.[0]);
  const namaPenjual = namaPenjualMatched
    ? namaPenjualMatched.replace(/^Nama\s*:\s*/i, "").replace(/(\d+)\s*$/, "").trim()
    : "";

  const namaPembeliMatched =
    fromType === "jpg"
      ? normalize(namaMatches[1]?.[1])
      : normalize(namaMatches[0]?.[0]);
  const namaPembeli = namaPembeliMatched
    ? namaPembeliMatched.replace(/^Nama\s*:\s*/i, "").replace(/(\d+)\s*$/, "").trim()
    : "";
    
  const dateMatch = text.match(/,\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/);
  const tanggalFaktur = dateMatch ? dateMatch[1].trim() : "";

  const { jumlahDpp, jumlahPpn } = extractDppAndPpn(text);

  return {
    nomorFaktur: getLast10Faktur(nomorFaktur || ""),
    tanggalFaktur: formatIndoDate(tanggalFaktur),
    npwpPenjual: normalizeNpwp(npwpPenjual),
    namaPenjual,
    npwpPembeli: normalizeNpwp(npwpPembeli),
    namaPembeli,
    jumlahDpp,
    jumlahPpn,
  };
};

function normalizeNpwp(input) {
  const npwp = input.replace(/[^0-9]/g, "");

  return Number(stripLeadingZeros(npwp));
}

function stripLeadingZeros(npwp) {
  if (npwp.startsWith("00")) {
    return npwp.slice(2);
  } else if (npwp.startsWith("0")) {
    return npwp.slice(1);
  }
  return npwp;
}

function getLast10Faktur(nomorFaktur) {
  const digits = nomorFaktur.replace(/[^0-9]/g, "");
  return Number(digits.slice(-12));
}

function formatIndoDate(input) {
  const months = {
    Januari: "01",
    Februari: "02",
    Maret: "03",
    April: "04",
    Mei: "05",
    Juni: "06",
    Juli: "07",
    Agustus: "08",
    September: "09",
    Oktober: "10",
    November: "11",
    Desember: "12",

    // Optional support for English
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const parts = input.trim().split(/\s+/);
  if (parts.length !== 3) return "";

  const [day, month, year] = parts;
  const monthNum = months[month];
  if (!monthNum) return "";

  return `${day.padStart(2, "0")}/${monthNum}/${year}`;
}

function normalizeCurrency(str) {
  return parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0;
}

function extractDppAndPpn(text) {
  const lines = text.split("\n");

  let jumlahDpp = "";
  let jumlahPpn = "";

  for (const line of lines) {
    if (/PPN/i.test(line) && /Dasar Pengenaan Pajak/i.test(line)) {
      // Extract PPN
      const match = line.match(/Dasar Pengenaan Pajak\s*([0-9.,]+)/i);
      if (match) jumlahPpn = normalizeCurrency(match[1].trim());
    } else if (/Dasar Pengenaan Pajak/i.test(line)) {
      // Extract clean DPP (not from PPN line)
      const match = line.match(/Dasar Pengenaan Pajak\s*([0-9.,]+)/i);
      if (match) jumlahDpp = normalizeCurrency(match[1].trim());
    }
  }

  return { jumlahDpp, jumlahPpn };
}
