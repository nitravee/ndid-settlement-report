const moment = require('moment');

const CONFIG_HEIGHT_TIMESTAMP_FORMAT = 'YYYYMMDDHHmmss';

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

function getConfigHeight(heightFolderName = '') {
  const splitted = heightFolderName.split('_');

  return {
    height: parseInt(splitted[0], 10),
    timestamp:
      splitted[1] ? moment(splitted[1], CONFIG_HEIGHT_TIMESTAMP_FORMAT).toDate() : undefined,
  };
}

function compareConfigHeight(a, b) {
  if (a.height !== b.height) {
    if (a.height == null) {
      return -1;
    }
    if (b.height == null) {
      return 1;
    }
    return a.height - b.height;
  }

  if (isNaN(a.timestamp) && isNaN(b.timestamp)) {
    return 0;
  }
  if (!a.timestamp || isNaN(a.timestamp)) {
    return -1;
  }
  if (!b.timestamp || isNaN(b.timestamp)) {
    return 1;
  }

  return a.timestamp.getTime() - b.timestamp.getTime();
}

function groupConfigHeightsByHeight(configHeights) {
  const heightMap = {};
  configHeights.forEach((confHeight) => {
    if (heightMap[confHeight.height]) {
      heightMap[confHeight.height].push(confHeight);
    } else {
      heightMap[confHeight.height] = [confHeight];
    }
  });

  Object.keys(heightMap).forEach((h) => {
    heightMap[h].sort(compareConfigHeight);
  });

  return heightMap;
}

function selectConfigHeightByTimestamp(sortedConfigHeights = [], configTimestamp) {
  if (sortedConfigHeights.length === 0) {
    return undefined;
  }

  if (configTimestamp == null || isNaN(configTimestamp)) {
    return sortedConfigHeights[0];
  }

  for (let i = 0; i < sortedConfigHeights.length; i++) {
    const currConfHeightTimestamp =
      sortedConfigHeights[i] && sortedConfigHeights[i].timestamp;
    const nextConfHeightTimestamp =
      sortedConfigHeights[i + 1] && sortedConfigHeights[i + 1].timestamp;
    if (
      (!currConfHeightTimestamp
        || isNaN(currConfHeightTimestamp)
        || configTimestamp.getTime() >= currConfHeightTimestamp.getTime())
      && (!nextConfHeightTimestamp
        || isNaN(nextConfHeightTimestamp)
        || configTimestamp.getTime() < nextConfHeightTimestamp.getTime())
    ) {
      return sortedConfigHeights[i];
    }
  }

  return sortedConfigHeights[0];
}

module.exports = {
  getHeightDependentConfig,
  getMonthYearDependentConfig,
  compareMonthYear,
  getConfigHeight,
  compareConfigHeight,
  groupConfigHeightsByHeight,
  selectConfigHeightByTimestamp,
  CONFIG_HEIGHT_TIMESTAMP_FORMAT,
};
