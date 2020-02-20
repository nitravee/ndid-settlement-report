const fs = require('fs');
const { join } = require('path');
const { getDirectories } = require('./utils/pathUtil');
const { UNKNOWN_ORG, UNKNOWN_ORG_SHORT_NAME } = require('./getNodeIdToOrgMapping');


function importOrgInfoForBlockHeightRange(minBlockHeight, maxBlockHeight, orgJsonFilePath) {
  const orgInfoJson = JSON.parse(fs.readFileSync(orgJsonFilePath, 'utf8'));
  return {
    min_block_height: minBlockHeight,
    max_block_height: maxBlockHeight,
    org_info: { ...orgInfoJson, [UNKNOWN_ORG_SHORT_NAME]: UNKNOWN_ORG },
  };
}

function importOrgInfo(rootOrgInfoDirPath) {
  const heightDirPaths = getDirectories(rootOrgInfoDirPath);
  const minHeights = heightDirPaths
    .map(dirPath => parseInt(dirPath.substring(dirPath.lastIndexOf('/') + 1), 10))
    .filter(h => isFinite(h))
    .sort((a, b) => a - b);

  const result = [];
  for (let i = 0; i < minHeights.length; i++) {
    const minHeight = minHeights[i];
    const maxHeight = minHeights[i + 1] ? minHeights[i + 1] - 1 : undefined;

    result.push(importOrgInfoForBlockHeightRange(minHeight, maxHeight, join(rootOrgInfoDirPath, minHeight.toString(), 'orgInfo.json')));
  }

  return result;
}

module.exports = {
  importOrgInfo,
};
