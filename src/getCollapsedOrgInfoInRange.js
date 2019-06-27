function getCollapsedOrgInfoInRange(orgInfo, minBlockHeight, maxBlockHeight) {
  return orgInfo
    .filter((entry) => {
      const {
        min_block_height: entryMinHeight,
        max_block_height: entryMaxHeight,
      } = entry;

      if (minBlockHeight > entryMaxHeight) {
        return false;
      }
      if (maxBlockHeight < entryMinHeight) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.min_block_height - b.min_block_height)
    .reduce((prev, entry) => {
      const {
        org_info: entryOrgInfo,
      } = entry;
      return Object.assign({}, prev, entryOrgInfo);
    }, {});
}

module.exports = { getCollapsedOrgInfoInRange };
