const { join } = require('path');
const fs = require('fs');
const { getDirectories } = require('./utils/pathUtil');

const DEFAULT_GROUP_NAME = 'Default';
const DEFAULT_GROUP = {
  name: DEFAULT_GROUP_NAME,
};

function importRpGroups(groupDirPath) {
  const heightDirPaths = getDirectories(groupDirPath);
  const minHeights = heightDirPaths
    .map(dirPath => parseInt(dirPath.substring(dirPath.lastIndexOf('/') + 1), 10))
    .sort((a, b) => a - b);

  const result = [];
  for (let i = 0; i < minHeights.length; i++) {
    const minHeight = minHeights[i];
    const maxHeight = minHeights[i + 1] ? minHeights[i + 1] - 1 : undefined;
    const dirPath = join(groupDirPath, minHeight.toString(), 'rpGroups.json');

    const rpGroups = JSON.parse(fs.readFileSync(dirPath, 'utf8'));

    result.push({
      min_block_height: minHeight,
      max_block_height: maxHeight,
      rp_groups: rpGroups,
    });
  }

  return result;
}

function getGroupOfNodeId(rpGroups, nodeId, blockHeight) {
  const scopedGrps = rpGroups
    .filter((item) => {
      if (item.max_block_height == null) {
        return blockHeight >= item.min_block_height;
      }
      return blockHeight >= item.min_block_height
        && blockHeight <= item.max_block_height;
    })[0].rp_groups;

  const relatedGrp = Object
    .keys(scopedGrps)
    .map(grpName => Object.assign({}, scopedGrps[grpName], { name: grpName }))
    .filter(grp => grp.node_ids.includes(nodeId))[0];
  return relatedGrp || DEFAULT_GROUP;
}

module.exports = {
  importRpGroups,
  getGroupOfNodeId,
  DEFAULT_GROUP,
};
