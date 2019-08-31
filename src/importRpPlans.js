const { join } = require('path');
const fs = require('fs');
const { getDirectories } = require('./utils/pathUtil');
const { getHeightDependentConfig } = require('./utils/configUtil');


const RP_PLAN_TYPE = {
  PER_STAMP: 'perStamp',
  PREPAID: 'prepaid',
};

function importRpPlans(planDirPath, rpPlanDetails, chainId, minBlockHeight, maxBlockHeight) {
  const orgDirPaths = getDirectories(planDirPath);
  const orgs = orgDirPaths
    .map(dirPath => dirPath.substring(dirPath.lastIndexOf('/') + 1));
  const result = {};

  for (let i = 0; i < orgs.length; i++) {
    result[orgs[i]] = [];

    const orgDirPath = orgDirPaths[i];
    const orgChainDirPath = join(orgDirPath, chainId);
    const heightDirPaths = getDirectories(orgChainDirPath);
    const minHeights = heightDirPaths
      .map(dirPath => parseInt(dirPath.substring(dirPath.lastIndexOf('/') + 1), 10))
      .sort((a, b) => a - b);

    // Validate height
    if (minHeights.filter(h => h > minBlockHeight && h <= maxBlockHeight).length > 0) {
      throw new Error('Invalid RP plan config. Config height must not be in range (min_block_height, max_block_height].');
    }

    for (let j = 0; j < minHeights.length; j++) {
      const minHeight = minHeights[j];
      const maxHeight = minHeights[j + 1] ? minHeights[j + 1] - 1 : undefined;
      const dirPath = join(orgChainDirPath, minHeight.toString());
      const rpPlan = fs.readFileSync(join(dirPath, 'rpPlan.txt'), 'utf8');
      const planDetail = getHeightDependentConfig(rpPlanDetails, minHeight, 'rp_plan_detail');

      // Validate if RP plans aligns with plan detail
      if (!planDetail[rpPlan]) {
        throw new Error(`Unsupported RP plan (${rpPlan}) in ${join(dirPath, 'rpPlan.txt')}`);
      }

      result[orgs[i]].push({
        min_block_height: minHeight,
        max_block_height: maxHeight,
        rp_plan: rpPlan,
      });
    }
  }

  return result;
}

function importRpPlanDetails(planDetailDirPath, minBlockHeight, maxBlockHeight) {
  const heightDirPaths = getDirectories(planDetailDirPath);
  const minHeights = heightDirPaths
    .map(dirPath => parseInt(dirPath.substring(dirPath.lastIndexOf('/') + 1), 10))
    .sort((a, b) => a - b);

  // Validate height
  if (minHeights.filter(h => h > minBlockHeight && h <= maxBlockHeight).length > 0) {
    throw new Error('Invalid RP plan detail config. Config height must not be in range (min_block_height, max_block_height].');
  }

  const result = [];
  for (let i = 0; i < minHeights.length; i++) {
    const minHeight = minHeights[i];
    const maxHeight = minHeights[i + 1] ? minHeights[i + 1] - 1 : undefined;
    const dirPath = join(planDetailDirPath, minHeight.toString(), 'planDetail.json');

    const rpPlanDetail = JSON.parse(fs.readFileSync(dirPath, 'utf8'));
    Object.keys(rpPlanDetail).forEach((planName) => {
      rpPlanDetail[planName].name = planName;
    });

    result.push({
      min_block_height: minHeight,
      max_block_height: maxHeight,
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
