function financialNumberFormat(number, decimalPlaces = 2) {
  const numberStr = Math.abs(number).toFixed(decimalPlaces);
  return number < 0 ? `(${numberStr})` : numberStr;
}

module.exports = {
  financialNumberFormat,
};
