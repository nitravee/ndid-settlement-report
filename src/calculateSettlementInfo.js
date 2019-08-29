
const _ = require('lodash');
const { getGroupOfNodeId } = require('./importRpGroups');


function getIdpFullPrice(priceList, nodeId, requestedAal, requestedIal, rpGroup) {
  if (!priceList[rpGroup.name]) {
    return 0;
  }

  const idpPriceList = priceList[rpGroup.name].idp;
  const nodePriceList = idpPriceList[nodeId] || {};
  return (nodePriceList[requestedAal] && nodePriceList[requestedAal][requestedIal]) || 0;
}

function getAsFullPrice(priceList, nodeId, serviceId, rpGroup) {
  if (!priceList[rpGroup.name]) {
    return 0;
  }

  const asPriceList = priceList[rpGroup.name].as;
  const nodePriceList = asPriceList[nodeId] || {};
  return nodePriceList[serviceId] || 0;
}

function calculateSettlementInfo(objData, priceList, rpGroups) {
  const result = _.cloneDeep(objData);

  // Finished requests
  const { finishedRequests } = result;
  for (const rootName in finishedRequests) {
    const { settlement } = finishedRequests[rootName];
    const rpNodeId = settlement.requester_node_id;
    const rpGroup = getGroupOfNodeId(rpGroups, rpNodeId, settlement.height);

    const filteredPriceList = priceList
      .filter((item) => {
        if (item.max_block_height == null) {
          return settlement.height >= item.min_block_height;
        }
        return settlement.height >= item.min_block_height
          && settlement.height <= item.max_block_height;
      })[0];

    const scopedPriceList = filteredPriceList.prices;
    settlement.idpList.forEach((dataInIdpList, index) => {
      const { idp_id, min_aal, min_ial } = dataInIdpList;
      const idp_full_price = getIdpFullPrice(scopedPriceList, idp_id, min_aal, min_ial, rpGroup);
      const idp_price = idp_full_price * dataInIdpList.idp_fee_ratio;
      settlement.idpList[index] = { ...dataInIdpList, idp_price, idp_full_price };
    });
    settlement.asList.forEach((dataInAsList, index) => {
      const { as_id, service_id, as_fee_ratio } = dataInAsList;
      const as_full_price = getAsFullPrice(scopedPriceList, as_id, service_id, rpGroup);
      const as_price = as_full_price * as_fee_ratio;
      settlement.asList[index] = { ...dataInAsList, as_price, as_full_price };
    });
  }

  return result;
}

module.exports.calculateSettlementInfo = calculateSettlementInfo;
