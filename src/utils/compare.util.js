exports.compareData = (pdf, djp) => {
  const fields = Object.keys(djp);
  const deviations = [];

  fields.forEach(field => {
    if (!pdf[field]) {
      deviations.push({ field, pdf_value: null, djp_api_value: djp[field], deviation_type: 'missing_in_pdf' });
    } else if (!djp[field]) {
      deviations.push({ field, pdf_value: pdf[field], djp_api_value: null, deviation_type: 'missing_in_api' });
    } else if (pdf[field] !== djp[field]) {
      deviations.push({ field, pdf_value: pdf[field], djp_api_value: djp[field], deviation_type: 'mismatch' });
    }
  });

  return {
    deviations,
    validated_data: djp,
  };
};
