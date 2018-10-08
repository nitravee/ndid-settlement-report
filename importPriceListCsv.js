const csv = require('csvtojson');
const fs = require('fs');

async function importPriceList(minBlockHeight, maxBlockHeight, idpPricePath, asPricePath, orgToNodeIdMapPath) {
  if (!idpPricePath || !asPricePath || !orgToNodeIdMapPath) {
    console.error('Import price list failed. Missing parameter(s).');
    return;
  }

  const idpJsonArray = await csv().fromFile(idpPricePath);
  const asJsonArray = await csv().fromFile(asPricePath);

  const mapping = JSON.parse(fs.readFileSync(orgToNodeIdMapPath, 'utf8'));

  if (!idpJsonArray || !idpJsonArray || !mapping) {
    console.error('Import price list failed. Import file(s) failed.');
    return;
  }

  const prices = {
    idp: {},
    as: {},
  };

  for (const row of idpJsonArray) {
    const orgNames = Object.keys(row).slice(2);
    const aal = row['aal'];
    const ial = row['ial'];
    
    for (const name of orgNames) {
      const idpNodeIds = mapping[name]['idp'];
      if (!idpNodeIds || idpNodeIds.length === 0) {
        continue;
      } 

      for (const nodeId of idpNodeIds) {
        if (!prices['idp'][nodeId]) {
          prices['idp'][nodeId] = {};
        }

        if (!prices['idp'][nodeId][aal]) {
          prices['idp'][nodeId][aal] = {};
        }

        prices['idp'][nodeId][aal][ial] = parseInt(row[name]);
      }
    }
  }

  for (const row of asJsonArray) {
    const orgNames = Object.keys(row).slice(1);
    const data = row['Data'];
    
    for (const name of orgNames) {
      const asNodeIds = mapping[name]['as'];
      if (!asNodeIds || asNodeIds.length === 0) {
        continue;
      } 

      for (const nodeId of asNodeIds) {
        if (!prices['as'][nodeId]) {
          prices['as'][nodeId] = {};
        }

        prices['as'][nodeId][data] = parseInt(row[name]);
      }
    }
  }

  const result = {
    min_block_height: minBlockHeight,
    max_block_height: maxBlockHeight,
    prices,
  };

  return result;
}

module.exports = importPriceList;
