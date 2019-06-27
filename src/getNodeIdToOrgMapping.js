const _ = require('lodash');

const UNKNOWN_ORG_SHORT_NAME = 'UNKNOWN';
const UNKNOWN_ORG = {
  fullName: {
    en: 'Unknown',
  },
};

function getNodeIdToOrgMapping(orgInfo) {
  return orgInfo.map((entry) => {
    const { min_block_height, max_block_height, org_info } = entry;
    const mapping = Object.keys(org_info).reduce((prev, orgShortName) => {
      const anOrgInfo = org_info[orgShortName];
      const nodeIds = _
        .uniq([...(anOrgInfo.rp || []), ...(anOrgInfo.idp || []), ...(anOrgInfo.as || [])]);
      nodeIds.forEach((nodeId) => {
        prev[nodeId] = orgShortName;
      });
      return prev;
    }, {});

    return {
      min_block_height,
      max_block_height,
      mapping,
    };
  });
}

function getOrgShortNameByNodeId(nodeId, scopedNodeIdToOrgMapping = {}) {
  return scopedNodeIdToOrgMapping[nodeId] || UNKNOWN_ORG_SHORT_NAME;
}

function getOrgByNodeId(nodeId, collapsedNodeInfo = {}, nodeIdToOrgMapping = {}) {
  const shortName = nodeIdToOrgMapping[nodeId] || {};
  return collapsedNodeInfo[shortName];
}

function getOrgShortNameList(orgInfoEntryValue) {
  const rpList = [];
  const idpList = [];
  const asList = [];
  const allList = Object.keys(orgInfoEntryValue);

  for (const orgShortName of allList) {
    const org = orgInfoEntryValue[orgShortName];
    if (org.rp && org.rp.length > 0) {
      rpList.push(orgShortName);
    }
    if (org.idp && org.idp.length > 0) {
      idpList.push(orgShortName);
    }
    if (org.as && org.as.length > 0) {
      asList.push(orgShortName);
    }
  }

  if (!rpList.includes(UNKNOWN_ORG_SHORT_NAME)) {
    rpList.push(UNKNOWN_ORG_SHORT_NAME);
  }
  if (!idpList.includes(UNKNOWN_ORG_SHORT_NAME)) {
    idpList.push(UNKNOWN_ORG_SHORT_NAME);
  }
  if (!asList.includes(UNKNOWN_ORG_SHORT_NAME)) {
    asList.push(UNKNOWN_ORG_SHORT_NAME);
  }
  if (!allList.includes(UNKNOWN_ORG_SHORT_NAME)) {
    allList.push(UNKNOWN_ORG_SHORT_NAME);
  }

  return {
    rpList,
    idpList,
    asList,
    allList,
  };
}

module.exports = {
  getNodeIdToOrgMapping,
  getOrgShortNameByNodeId,
  getOrgByNodeId,
  getOrgShortNameList,
  UNKNOWN_ORG_SHORT_NAME,
  UNKNOWN_ORG,
};
