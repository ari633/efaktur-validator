const axios = require('axios');
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");

exports.fetchDJPData = async (url) => {
  const { data } = await axios.get(url);
  console.log('Fetched DJP Data:', data);
  const parser = new XMLParser();
  const parsed = parser.parse(data);
  const faktur = parsed.resValidateFakturPm;

  return {
    npwpPenjual: faktur.npwpPenjual,
    namaPenjual: faktur.namaPenjual,
    npwpPembeli: faktur.npwpLawanTransaksi,
    namaPembeli: faktur.namaLawanTransaksi,
    nomorFaktur: faktur.nomorFaktur,
    tanggalFaktur: faktur.tanggalFaktur,
    jumlahDpp: faktur.jumlahDpp,
    jumlahPpn: faktur.jumlahPpn,
  };
};
