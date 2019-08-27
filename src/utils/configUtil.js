function getHeightDependentConfig(configList, height, configKey) {
  const filteredList = configList
    .filter(entry => height >= entry.min_block_height
      && (entry.max_block_height == null || height <= entry.max_block_height));

  if (filteredList.length === 0) {
    return null;
  }

  return configKey ? filteredList[0][configKey] : filteredList[0];
}

function compareMonthYear(a, b) {
  if (a.year < b.year) { return -1; }
  if (a.year > b.year) { return 1; }
  return a.month - b.month;
}

function getMonthYearDependentConfig(configList, monthYear, configKey) {
  const filteredList = configList
    .filter((item) => {
      if (item.max_month_year == null) {
        // NOTE: monthYear >= item.min_month_year
        return compareMonthYear(monthYear, item.min_month_year) >= 0;
      }
      // NOTE: monthYear >= item.min_month_year && monthYear <= item.max_month_year
      return compareMonthYear(monthYear, item.min_month_year) >= 0
        && compareMonthYear(monthYear, item.max_month_year) <= 0;
    });

  if (filteredList.length === 0) {
    return null;
  }

  return configKey ? filteredList[0][configKey] : filteredList[0];
}

module.exports = { getHeightDependentConfig, getMonthYearDependentConfig, compareMonthYear };
