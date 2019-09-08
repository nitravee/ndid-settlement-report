const { join } = require('path');
const fs = require('fs');
const moment = require('moment');
const { getDirectories } = require('./utils/pathUtil');
const {
  getHeightDependentConfig,
  getConfigHeight,
  compareConfigHeight,
  groupConfigHeightsByHeight,
  selectConfigHeightByTimestamp,
  CONFIG_HEIGHT_TIMESTAMP_FORMAT,
} = require('./utils/configUtil');

const RP_PLAN_TYPE = {
  PER_STAMP: 'perStamp',
  PREPAID: 'prepaid',
};

function importRpPlans(
  planDirPath,
  rpPlanDetails,
  chainId,
  minBlockHeight,
  maxBlockHeight,
  configTimestamp,
) {
  const orgDirPaths = getDirectories(planDirPath);
  const orgs = orgDirPaths
    .map(dirPath => dirPath.substring(dirPath.lastIndexOf('/') + 1));
  const result = {};

  for (let i = 0; i < orgs.length; i++) {
    result[orgs[i]] = [];

    const orgDirPath = orgDirPaths[i];
    const orgChainDirPath = join(orgDirPath, chainId);
    const heightDirPaths = getDirectories(orgChainDirPath);
    const minConfigHeights = heightDirPaths
      .map(dirPath => getConfigHeight(dirPath.substring(dirPath.lastIndexOf('/') + 1)))
      .filter(confHeight => isFinite(confHeight.height))
      .sort(compareConfigHeight);

    // Validate height
    const outOfRangeMinHeights = minConfigHeights
      .filter(h => h.height > minBlockHeight && h.height <= maxBlockHeight);
    if (outOfRangeMinHeights.length > 0) {
      throw new Error(`Invalid RP plan config. Config height (${outOfRangeMinHeights.join(',')}) must not be in range (min_block_height=${minBlockHeight}, max_block_height=${maxBlockHeight}].`);
    }

    // Filter with config timestamp
    const filteredMinConfigHeights = [];
    const minConfigHeightsGroupByHeight = groupConfigHeightsByHeight(minConfigHeights);
    Object.keys(minConfigHeightsGroupByHeight).sort((a, b) => a - b).forEach((h) => {
      filteredMinConfigHeights
        .push(selectConfigHeightByTimestamp(minConfigHeightsGroupByHeight[h], configTimestamp));
    });

    for (let j = 0; j < filteredMinConfigHeights.length; j++) {
      const minConfHeight = filteredMinConfigHeights[j];
      const minHeight = minConfHeight.height;
      const maxHeight = filteredMinConfigHeights[j + 1]
        ? filteredMinConfigHeights[j + 1].height - 1 : undefined;
      let folderName = minHeight.toString();
      if (minConfHeight.timestamp && !isNaN(minConfHeight.timestamp)) {
        folderName += `_${moment(minConfHeight.timestamp).format(CONFIG_HEIGHT_TIMESTAMP_FORMAT)}`;
      }
      const dirPath = join(orgChainDirPath, folderName);
      const rpPlan = fs.readFileSync(join(dirPath, 'rpPlan.txt'), 'utf8').trim();
      const planDetail = getHeightDependentConfig(rpPlanDetails, minHeight, 'rp_plan_detail');

      // Validate if RP plans aligns with plan detail
      if (!planDetail[rpPlan]) {
        console.error(`RP plan (${rpPlan}) not found in RP plan detail`, planDetail);
        throw new Error(`Unsupported RP plan (${rpPlan}) in ${join(dirPath, 'rpPlan.txt')}`);
      }

      result[orgs[i]].push({
        min_block_height: minHeight,
        max_block_height: maxHeight,
        min_block_height_timestamp: minConfHeight.timestamp,
        rp_plan: rpPlan,
      });
    }
  }

  return result;
}

function importRpPlanDetails(planDetailDirPath, minBlockHeight, maxBlockHeight, configTimestamp) {
  const heightDirPaths = getDirectories(planDetailDirPath);
  const minConfigHeights = heightDirPaths
    .map(dirPath => getConfigHeight(dirPath.substring(dirPath.lastIndexOf('/') + 1)))
    .filter(confHeight => isFinite(confHeight.height))
    .sort(compareConfigHeight);

  // Validate height
  const outOfRangeMinHeights = minConfigHeights
    .filter(h => h.height > minBlockHeight && h.height <= maxBlockHeight);
  if (outOfRangeMinHeights.length > 0) {
    throw new Error(`Invalid RP plan config. Config height (${outOfRangeMinHeights.join(',')}) must not be in range (min_block_height=${minBlockHeight}, max_block_height=${maxBlockHeight}].`);
  }

  // Filter with config timestamp
  const filteredMinConfigHeights = [];
  const minConfigHeightsGroupByHeight = groupConfigHeightsByHeight(minConfigHeights);
  Object.keys(minConfigHeightsGroupByHeight).sort((a, b) => a - b).forEach((h) => {
    filteredMinConfigHeights
      .push(selectConfigHeightByTimestamp(minConfigHeightsGroupByHeight[h], configTimestamp));
  });

  const result = [];
  for (let i = 0; i < filteredMinConfigHeights.length; i++) {
    const minConfHeight = filteredMinConfigHeights[i];
    const minHeight = minConfHeight.height;
    const maxHeight = filteredMinConfigHeights[i + 1]
      ? filteredMinConfigHeights[i + 1].height - 1 : undefined;
    let folderName = minHeight.toString();
    if (minConfHeight.timestamp && !isNaN(minConfHeight.timestamp)) {
      folderName += `_${moment(minConfHeight.timestamp).format(CONFIG_HEIGHT_TIMESTAMP_FORMAT)}`;
    }
    const dirPath = join(planDetailDirPath, folderName, 'planDetail.json');

    const rpPlanDetail = JSON.parse(fs.readFileSync(dirPath, 'utf8'));
    Object.keys(rpPlanDetail).forEach((planName) => {
      rpPlanDetail[planName].name = planName;
    });

    result.push({
      min_block_height: minHeight,
      max_block_height: maxHeight,
      min_block_height_timestamp: minConfHeight.timestamp,
      rp_plan_detail: rpPlanDetail,
    });
  }

  return result;
}

function getRpPlanOfOrg(rpPlans, rpPlanDetails, org, height) {
  const scopedPlanDetail = getHeightDependentConfig(rpPlanDetails, height, 'rp_plan_detail');
  const planName = getHeightDependentConfig(rpPlans[org] || [], height, 'rp_plan');
  return (scopedPlanDetail && planName && scopedPlanDetail[planName]) || {
    steps: [
      {
        type: 'perStamp',
        numberOfStamps: 0,
        perStampRate: 0,
      },
    ],
  };
}

module.exports = {
  importRpPlans, importRpPlanDetails, getRpPlanOfOrg, RP_PLAN_TYPE,
};
