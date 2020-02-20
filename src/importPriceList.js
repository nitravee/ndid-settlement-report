const csv = require('csvtojson');
const { join } = require('path');
const _ = require('lodash');
const { getDirectories } = require('./utils/pathUtil');
const { getHeightDependentConfigsOverlappingHeightRange } = require('./utils/configUtil');


async function importPriceList(
  minBlockHeight,
  maxBlockHeight,
  orgInfo,
  heightDirPath,
) {
  const filteredOrgInfo =
    getHeightDependentConfigsOverlappingHeightRange(orgInfo, minBlockHeight, maxBlockHeight)
      .sort((a, b) => a.min_block_height - b.min_block_height);

  const result = [];

  const grpDirPaths = getDirectories(heightDirPath);
  const grps = grpDirPaths
    .map(dirPath => dirPath.substring(dirPath.lastIndexOf('/') + 1));

  for (const orgInfoEntry of filteredOrgInfo) {
    const resultEntryMinHeight = Math.max(minBlockHeight, orgInfoEntry.min_block_height);
    let resultEntryMaxHeight = maxBlockHeight;
    if (orgInfoEntry.max_block_height
      && (orgInfoEntry.max_block_height < resultEntryMaxHeight || resultEntryMaxHeight == null)) {
      resultEntryMaxHeight = orgInfoEntry.max_block_height;
    }

    const mapping = orgInfoEntry.org_info;
    let prices = {};

    for (const grp of grps) {
      const dirPath = join(heightDirPath, grp);
      const idpJsonArray = await csv({ flatKeys: true }).fromFile(join(dirPath, 'idp_price.csv'));
      const asJsonArray = await csv({ flatKeys: true }).fromFile(join(dirPath, 'as_price.csv'));

      const grpPrices = {
        idp: {},
        as: {},
      };

      for (const row of idpJsonArray) {
        const orgNames = Object.keys(row).slice(2);
        const { aal, ial } = row;

        for (const name of orgNames) {
          const orgNodeMap = mapping[name];
          if (!orgNodeMap) {
            continue;
          }
          const { idp: idpNodeIds } = orgNodeMap;

          if (idpNodeIds && idpNodeIds.length > 0) {
            for (const nodeId of idpNodeIds) {
              if (!grpPrices.idp[nodeId]) {
                grpPrices.idp[nodeId] = {};
              }

              if (!grpPrices.idp[nodeId][aal]) {
                grpPrices.idp[nodeId][aal] = {};
              }

              grpPrices.idp[nodeId][aal][ial] = parseFloat(row[name]);
            }
          }
        }
      }

      for (const row of asJsonArray) {
        const orgNames = Object.keys(row).slice(1);
        const { Data: data } = row;

        for (const name of orgNames) {
          const orgNodeMap = mapping[name];
          if (!orgNodeMap) {
            continue;
          }
          const { as: asNodeIds } = orgNodeMap;
          if (asNodeIds && asNodeIds.length > 0) {
            for (const nodeId of asNodeIds) {
              if (!grpPrices.as[nodeId]) {
                grpPrices.as[nodeId] = {};
              }

              grpPrices.as[nodeId][data] = parseFloat(row[name]);
            }
          }
        }
      }

      prices = { ...prices, [grp]: grpPrices };
    }

    const resultEntry = {
      min_block_height: resultEntryMinHeight,
      max_block_height: resultEntryMaxHeight,
      prices,
    };
    result.push(resultEntry);
  }

  return result;
}

async function importPriceListDirectories(rootPriceDirPath, orgInfo) {
  if (!rootPriceDirPath) {
    console.error('Root price directory path must be specific.');
    return undefined;
  }

  const heightDirPaths = getDirectories(rootPriceDirPath);
  const minHeights = heightDirPaths
    .map(dirPath => parseInt(dirPath.substring(dirPath.lastIndexOf('/') + 1), 10))
    .filter(h => isFinite(h))
    .sort((a, b) => a - b);

  const result = {
    prices: [],
  };
  for (let i = 0; i < minHeights.length; i++) {
    const minHeight = minHeights[i];
    const maxHeight = minHeights[i + 1] ? minHeights[i + 1] - 1 : undefined;
    const heightDirPath = join(rootPriceDirPath, minHeight.toString());

    const grpPrices = await importPriceList(
      minHeight,
      maxHeight,
      orgInfo,
      heightDirPath,
    );

    result.prices = result.prices.concat(grpPrices);
  }

  return result;
}

function getPriceCategories(priceList) {
  const priceCatsObj = priceList
    .map((priceInfo) => {
      const { prices } = priceInfo;
      const { idp, as } = Object.values(prices)[0];
      const sampleIdpPrice = Object.values(idp)[0];
      const idpPriceCats = Object.keys(sampleIdpPrice).reduce(
        (catList, aal) =>
          catList.concat(Object.keys(sampleIdpPrice[aal]).map(ial => ({ ial, aal }))),
        [],
      );
      const sampleAsPrice = Object.values(as)[0];
      const asPriceCats = Object.keys(sampleAsPrice);

      return {
        idp: idpPriceCats,
        as: asPriceCats,
      };
    })
    .reduce(
      (prev, curr) => ({
        idp: _.uniqWith(prev.idp.concat(curr.idp), _.isEqual),
        as: _.uniq(prev.as.concat(curr.as)),
      }),
      { idp: [], as: [] },
    );

  priceCatsObj.idp = priceCatsObj
    .idp
    .sort((a, b) => {
      const aIal = parseFloat(a.ial);
      const bIal = parseFloat(b.ial);
      if (aIal < bIal) {
        return -1;
      }
      if (aIal > bIal) {
        return 1;
      }

      const aAal = parseFloat(a.aal);
      const bAal = parseFloat(b.aal);
      return aAal - bAal;
    });

  return priceCatsObj;
}

module.exports = {
  importPriceList,
  importPriceListDirectories,
  getPriceCategories,
};
