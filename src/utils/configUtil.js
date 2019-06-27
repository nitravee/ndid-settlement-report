function getHeightDependentConfig(configList, height, configKey) {
  const filteredList = configList
    .filter(entry => height >= entry.min_block_height
      && (entry.max_block_height == null || height <= entry.max_block_height));

  if (filteredList.length === 0) {
    return null;
  }

  return filteredList[0][configKey];
}

module.exports = { getHeightDependentConfig };
