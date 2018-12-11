// App code here

// const value = require('./expected1');

const _ = require('lodash');
const fs = require('fs');
const mkpath = require('mkpath');
const { join } = require('path');
const Json2csvParser = require('json2csv').Parser;
const { genSummaryByOrgReport } = require('./genSummaryByOrgReport');
const { reportFileName } = require('./utils/pathUtil');
const {
  pendingParser,
  rpIdpParser,
  rpIdpSumParser,
  rpAsParser,
  rpAsSumParser,
  rpNdidParser,
  rpNdidSumParser,
  rpNdidSumByOrgParser,
} = require('./csvParsers');
const { logFileCreated } = require('./utils/logUtil');


const NDID_PRICE_PER_REQ = 5;


function heightCompare(rowA, rowB) {
  return rowA.height - rowB.height;
}

function getNodeName(aNodeInfo = {}) {
  return aNodeInfo.node_name;
}

function getNodeNameObj(aNodeInfo = {}) {
  return aNodeInfo.node_name_obj;
}

function getNodeNames(nodeInfo, nodeIds) {
  return nodeIds.map(id => getNodeName(nodeInfo[id])).join(', ');
}

function genRowsFromPendingRequest(req, nodeInfo) {
  const { detail, settlement } = req;

  const rows = (detail.data_request_list.length > 0 ? detail.data_request_list : [{}])
    .map(({ as_id_list: asIdList = [], service_id: serviceId = '' }) => ({
      rp_id: settlement.requester_node_id,
      rp_name: getNodeName(nodeInfo[settlement.requester_node_id]),
      request_id: settlement.request_id,
      status: settlement.status,
      closed: settlement.closed ? 'Yes' : 'No',
      timed_out: settlement.timed_out ? 'Yes' : 'No',
      height: settlement.height,
      mode: settlement.mode,
      idp_ids: detail.idp_id_list.join(', '),
      idp_names: getNodeNames(nodeInfo, detail.idp_id_list),
      min_ial: detail.min_ial,
      min_aal: detail.min_aal,
      service_id: serviceId,
      as_ids: asIdList.join(', '),
      as_names: getNodeNames(nodeInfo, asIdList),
    }));

  return rows;
}

function genRowsFromRequest(req, nodeInfo) {
  const { settlement } = req;

  const rpIdp = [];
  settlement.idpList.forEach((item) => {
    const request = {};
    request.rp_id = settlement.requester_node_id;
    request.rp_name = getNodeName(nodeInfo[settlement.requester_node_id]);
    request.rp_name_obj = getNodeNameObj(nodeInfo[settlement.requester_node_id]);
    request.request_id = settlement.request_id;
    request.status = settlement.status;
    request.closed = settlement.closed ? 'Yes' : 'No';
    request.timed_out = settlement.timed_out ? 'Yes' : 'No';
    request.height = settlement.height;
    request.mode = settlement.mode;
    request.idp_id = item.idp_id;
    request.idp_name = getNodeName(nodeInfo[item.idp_id]);
    request.idp_name_obj = getNodeNameObj(nodeInfo[item.idp_id]);
    request.min_ial = item.min_ial;
    request.min_aal = item.min_aal;
    request.ial = item.ial;
    request.aal = item.aal;
    request.response = item.status;

    if (item.valid_signature == null) {
      request.valid_idp_response_signature = 'N/A';
    } else {
      request.valid_idp_response_signature = item.valid_signature === true ? 'Yes' : 'No';
    }

    if (item.valid_ial == null) {
      request.valid_idp_response_ial = 'N/A';
    } else {
      request.valid_idp_response_ial = item.valid_ial === true ? 'Yes' : 'No';
    }

    request.price = _.round(item.idp_price, 2);
    request.full_price = _.round(item.idp_full_price, 2);

    if (request.rp_name_obj != null && request.idp_name_obj != null) {
      rpIdp.push(request);
    }
  });

  const rpAs = [];
  settlement.asList.forEach((item) => {
    const request = {};
    request.rp_id = settlement.requester_node_id;
    request.rp_name = getNodeName(nodeInfo[settlement.requester_node_id]);
    request.rp_name_obj = getNodeNameObj(nodeInfo[settlement.requester_node_id]);
    request.request_id = settlement.request_id;
    request.status = settlement.status;
    request.closed = settlement.closed ? 'Yes' : 'No';
    request.timed_out = settlement.timed_out ? 'Yes' : 'No';
    request.height = settlement.height;
    request.mode = settlement.mode;
    request.as_id = item.as_id;
    request.as_name = getNodeName(nodeInfo[item.as_id]);
    request.as_name_obj = getNodeNameObj(nodeInfo[item.as_id]);
    request.service_id = item.service_id;
    request.data_answered = item.data_answered ? 'Yes' : 'No';
    request.data_received = item.data_received ? 'Yes' : 'No';
    request.price = _.round(item.as_price, 2);
    request.full_price = _.round(item.as_full_price, 2);

    if (request.rp_name_obj != null && request.as_name_obj != null) {
      rpAs.push(request);
    }
  });


  const rpNdid = getNodeNameObj(nodeInfo[settlement.requester_node_id]) != null ? [{
    rp_id: settlement.requester_node_id,
    rp_name: getNodeName(nodeInfo[settlement.requester_node_id]),
    rp_name_obj: getNodeNameObj(nodeInfo[settlement.requester_node_id]),
    request_id: settlement.request_id,
    status: settlement.status,
    closed: settlement.closed ? 'Yes' : 'No',
    timed_out: settlement.timed_out ? 'Yes' : 'No',
    height: settlement.height,
    mode: settlement.mode,
    price: NDID_PRICE_PER_REQ,
  }] : [];

  return {
    rpIdp,
    rpAs,
    rpNdid,
  };
}

function getOrgInfo(nodeNameObj) {
  if (!nodeNameObj) {
    return undefined;
  }

  return {
    industryCode: nodeNameObj.industry_code,
    companyCode: nodeNameObj.company_code,
    marketingNameTh: nodeNameObj.marketing_name_th,
    marketingNameEn: nodeNameObj.marketing_name_en,
    proxyOrSubsidiaryNameTh: nodeNameObj.proxy_or_subsidiary_name_th,
    proxyOrSubsidiaryNameEn: nodeNameObj.proxy_or_subsidiary_name_en,
  };
}

function getOrgList(nodeList) {
  const rpList = _.uniq(nodeList
    .rpList
    .map(nodeInfo => nodeInfo.org && nodeInfo.org.marketingNameEn)
    .filter(orgName => orgName));
  const idpList = _.uniq(nodeList
    .idpList
    .map(nodeInfo => nodeInfo.org && nodeInfo.org.marketingNameEn)
    .filter(orgName => orgName));
  const asList = _.uniq(nodeList
    .asList
    .map(nodeInfo => nodeInfo.org && nodeInfo.org.marketingNameEn)
    .filter(orgName => orgName));
  const allList = _.uniq([...rpList, ...idpList, ...asList]);

  return {
    rpList,
    idpList,
    asList,
    allList,
  };
}

function getNodeList(allRows) {
  const rpList = [];
  const idpList = [];
  const asList = [];
  allRows.rpIdp.forEach((item) => {
    if (!rpList.find(node => node.id === item.rp_id)) {
      rpList.push({
        id: item.rp_id,
        org: getOrgInfo(item.rp_name_obj),
      });
    }
    if (!idpList.find(node => node.id === item.idp_id)) {
      idpList.push({
        id: item.idp_id,
        org: getOrgInfo(item.idp_name_obj),
      });
    }
  });
  allRows.rpAs.forEach((item) => {
    if (!asList.find(node => node.id === item.as_id)) {
      asList.push({
        id: item.as_id,
        org: getOrgInfo(item.as_name_obj),
      });
    }
  });
  return {
    rpList,
    idpList,
    asList,
  };
}

function createFile(csv, filePathInOutputDir, outputDirPath) {
  const filePath = join(outputDirPath, filePathInOutputDir);
  mkpath.sync(filePath.substring(0, filePath.lastIndexOf('/')));
  fs.writeFile(filePath, `\ufeff${csv}`, 'utf8', (err) => {
    if (err) throw err;
  });
}

function genSummaryRpIdp(
  nodeId,
  requests,
  nodeIdList,
  checkRp,
  nodeInfo,
  billPeriod,
  blockRange,
  version,
  destDirPath,
) {
  const summary = [];
  nodeIdList.forEach((id) => {
    const filteredReqs = requests.filter(item =>
      (checkRp ? item.rp_id === id : item.idp_id === id));
    const sum = filteredReqs.reduce((prev, curr) => ({
      rpId: curr.rp_id,
      rpName: getNodeName(nodeInfo[curr.rp_id]),
      rpNameObj: getNodeNameObj(nodeInfo[curr.rp_id]),
      idpId: curr.idp_id,
      idpName: getNodeName(nodeInfo[curr.idp_id]),
      idpNameObj: getNodeNameObj(nodeInfo[curr.idp_id]),
      idpPrice: prev.idpPrice + curr.price,
    }), {
      idpPrice: 0,
    });
    sum.idpPrice = _.round(sum.idpPrice, 2);
    summary.push(sum);
  });
  const sumCsv = rpIdpSumParser.parse(summary);
  const fileNameWithExt = reportFileName({
    billPeriodStart: billPeriod.start,
    billPeriodEnd: billPeriod.end,
    minBlockHeight: blockRange.min,
    maxBlockHeight: blockRange.max,
    version,
    reportIdentifier: nodeId,
    rowCount: summary.length,
    extension: 'csv',
  });
  createFile(sumCsv, fileNameWithExt, destDirPath);
  logFileCreated(fileNameWithExt, destDirPath);
}

function genSummaryRpAs(
  nodeId,
  requests,
  checkDataList,
  checkRp,
  nodeInfo,
  billPeriod,
  blockRange,
  version,
  destDirPath,
) {
  const summary = [];
  checkDataList.forEach((checkData) => {
    const filteredReqs = requests.filter((item) => {
      if (checkRp) {
        return checkData.rpId === item.rp_id && checkData.serviceId === item.service_id;
      }
      return checkData.asId === item.as_id && checkData.serviceId === item.service_id;
    });
    const sumRpAs = filteredReqs.reduce((prev, curr) => ({
      rpId: curr.rp_id,
      rpName: getNodeName(nodeInfo[curr.rp_id]),
      rpNameObj: getNodeNameObj(nodeInfo[curr.rp_id]),
      asId: curr.as_id,
      asName: getNodeName(nodeInfo[curr.as_id]),
      asNameObj: getNodeNameObj(nodeInfo[curr.as_id]),
      serviceId: curr.service_id,
      asPrice: prev.asPrice + curr.price,
    }), {
      asPrice: 0,
    });
    sumRpAs.asPrice = _.round(sumRpAs.asPrice, 2);
    summary.push(sumRpAs);
  });
  const sumCsv = rpAsSumParser.parse(summary);
  const fileNameWithExt = reportFileName({
    billPeriodStart: billPeriod.start,
    billPeriodEnd: billPeriod.end,
    minBlockHeight: blockRange.min,
    maxBlockHeight: blockRange.max,
    version,
    reportIdentifier: nodeId,
    rowCount: summary.length,
    extension: 'csv',
  });
  createFile(sumCsv, fileNameWithExt, destDirPath);
  logFileCreated(fileNameWithExt, destDirPath);
}

function genSummaryRpNdid(
  requests,
  rpId,
  nodeInfo,
  billPeriod,
  blockRange,
  version,
  destDirPath,
) {
  const rpReqs = requests.filter(req => req.rp_id === rpId);
  const row = rpReqs
    .reduce((prev, curr) => ({
      rpId: curr.rp_id,
      rpName: getNodeName(nodeInfo[curr.rp_id]),
      rpNameObj: getNodeNameObj(nodeInfo[curr.rp_id]),
      ndidPrice: prev.ndidPrice + curr.price,
    }), {
      ndidPrice: 0,
    });
  row.ndidPrice = _.round(row.ndidPrice, 2);
  row.numberOfTxns = rpReqs.length;

  const sumCsv = rpNdidSumParser.parse([row]);
  const fileNameWithExt = reportFileName({
    billPeriodStart: billPeriod.start,
    billPeriodEnd: billPeriod.end,
    minBlockHeight: blockRange.min,
    maxBlockHeight: blockRange.max,
    version,
    reportIdentifier: rpId,
    rowCount: 1,
    extension: 'csv',
  });
  createFile(sumCsv, fileNameWithExt, destDirPath);
  logFileCreated(fileNameWithExt, destDirPath);
}

function genCSV(
  settlementWithPrice,
  pendingRequests,
  nodeInfo,
  allPriceCategories,
  billPeriod,
  blockRange,
  version,
  outputCsvDirPath,
) {
  const reportFileNameFnBaseArg = {
    billPeriodStart: billPeriod.start,
    billPeriodEnd: billPeriod.end,
    minBlockHeight: blockRange.min,
    maxBlockHeight: blockRange.max,
    version,
  };

  const allPendingReqIds = Object.keys(pendingRequests);
  const allPendingReqRows = allPendingReqIds
    .map(reqId => genRowsFromPendingRequest(pendingRequests[reqId], nodeInfo))
    .reduce((prev, curr) => prev.concat(curr), []);
  createFile(pendingParser.parse(allPendingReqRows.sort(heightCompare)), 'pending.csv', outputCsvDirPath);
  logFileCreated('pending.csv', outputCsvDirPath);

  const allReqIds = Object.keys(settlementWithPrice);
  const allRows = allReqIds
    .map(reqId => genRowsFromRequest(settlementWithPrice[reqId], nodeInfo))
    .reduce((prev, curr) => ({
      rpIdp: prev.rpIdp.concat(curr.rpIdp),
      rpAs: prev.rpAs.concat(curr.rpAs),
      rpNdid: prev.rpNdid.concat(curr.rpNdid),
    }), {
      rpIdp: [],
      rpAs: [],
      rpNdid: [],
    });
  const nodeList = getNodeList(allRows);
  const orgList = getOrgList(nodeList);

  orgList.allList.forEach(orgName => mkpath.sync(`csv/${orgName}`));

  nodeList.rpList.forEach(({ id, org: { marketingNameEn } }) => {
    const rpIdp = [];
    allRows.rpIdp.forEach((row) => {
      if (id === row.rp_id) {
        rpIdp.push(row);
      }
    });
    const csv = rpIdpParser.parse(rpIdp.sort(heightCompare));
    const rpIdpFileNameWithExt = reportFileName({
      ...reportFileNameFnBaseArg, reportIdentifier: id, rowCount: rpIdp.length, extension: 'csv',
    });
    createFile(
      csv,
      rpIdpFileNameWithExt,
      join(outputCsvDirPath, marketingNameEn, 'rp-idp'),
    );
    logFileCreated(rpIdpFileNameWithExt, join(outputCsvDirPath, marketingNameEn, 'rp-idp'));

    const idpList = [];
    rpIdp.forEach((item) => {
      if (!idpList.includes(item.idp_id)) {
        idpList.push(item.idp_id);
      }
    });
    genSummaryRpIdp(
      id,
      rpIdp,
      idpList,
      false,
      nodeInfo,
      billPeriod,
      blockRange,
      version,
      join(outputCsvDirPath, marketingNameEn, 'rp-idp-summary'),
    );

    const rpNdid = allRows.rpNdid.filter(row => id === row.rp_id).sort(heightCompare);
    const rpNdidCsv = rpNdidParser.parse(rpNdid);
    const rpNdidFileNameWithExt = reportFileName(Object.assign(
      {},
      reportFileNameFnBaseArg,
      { reportIdentifier: id, rowCount: rpNdid.length, extension: 'csv' },
    ));
    createFile(
      rpNdidCsv,
      rpNdidFileNameWithExt,
      join(outputCsvDirPath, marketingNameEn, 'rp-ndid'),
    );
    logFileCreated(rpNdidFileNameWithExt, join(outputCsvDirPath, marketingNameEn, 'rp-ndid'));

    genSummaryRpNdid(
      allRows.rpNdid,
      id,
      nodeInfo,
      billPeriod,
      blockRange,
      version,
      join(outputCsvDirPath, marketingNameEn, 'rp-ndid-summary/'),
    );
  });

  orgList.rpList.forEach((rpMktName) => {
    const rpIdpRows = allRows.rpIdp.filter(row =>
      row.rp_name_obj.marketing_name_en === rpMktName);
    const rpAsRows = allRows.rpAs.filter(row =>
      row.rp_name_obj.marketing_name_en === rpMktName);
    const idpAsMktNames = _
      .uniq(rpIdpRows
        .map(row => row.idp_name_obj.marketing_name_en)
        .concat(rpAsRows
          .map(row => row.as_name_obj.marketing_name_en)))
      .filter(mktName => mktName); // Filter null out for now, TODO:

    // #################################
    // RP Summary by Org
    // #################################
    const idpRow = rpIdpRows
      .reduce((prev, curr) => {
        // Filter null out for now, TODO:
        if (!curr.idp_name_obj.marketing_name_en) {
          return prev;
        }

        const result = Object.assign({}, prev);
        result[curr.idp_name_obj.marketing_name_en] =
          (result[curr.idp_name_obj.marketing_name_en] || 0) + curr.price;
        return result;
      }, {
        ndidRole: 'IdP',
      });

    const asRow = rpAsRows
      .reduce((prev, curr) => {
        // Filter null out for now, TODO:
        if (!curr.as_name_obj.marketing_name_en) {
          return prev;
        }

        const result = Object.assign({}, prev);
        result[curr.as_name_obj.marketing_name_en] =
          (result[curr.as_name_obj.marketing_name_en] || 0) + curr.price;
        return result;
      }, {
        ndidRole: 'AS',
      });

    const totalRow = idpAsMktNames
      .reduce((prev, curr) => {
        const result = Object.assign({}, prev);
        result[curr] = (idpRow[curr] || 0) + (asRow[curr] || 0);
        return result;
      }, {
        ndidRole: 'Total',
      });

    const nonZeroTotalMktNames = idpAsMktNames.filter(mktName => totalRow[mktName]);
    const fieldsRpSummaryByOrg = [{
      label: 'NDID Role',
      value: 'ndidRole',
    }]
      .concat(idpAsMktNames
        .filter(mktName => nonZeroTotalMktNames.includes(mktName))
        .map(mktName => ({
          label: mktName,
          value: row => _.round(row[mktName] || 0, 2).toFixed(2),
          default: '0.00',
          stringify: false,
        })));

    const rpSumByOrgParser = new Json2csvParser({ fields: fieldsRpSummaryByOrg });
    const csv = rpSumByOrgParser.parse([idpRow, asRow, totalRow]);
    const rpSumByOrgFileNameWithExt = reportFileName({
      ...reportFileNameFnBaseArg, reportIdentifier: rpMktName, rowCount: fieldsRpSummaryByOrg.length - 1, extension: 'csv',
    });
    createFile(
      csv,
      rpSumByOrgFileNameWithExt,
      join(outputCsvDirPath, rpMktName, 'rp-summary-by-org'),
    );
    logFileCreated(rpSumByOrgFileNameWithExt, join(outputCsvDirPath, rpMktName, 'rp-summary-by-org'));

    // #################################
    // RP-IdP Summary by Org
    // #################################
    const rpIdpSumByOrg = rpIdpRows
      .reduce((prev, curr) => {
        const idpMktName = curr.idp_name_obj.marketing_name_en;

        // Filter null out for now, TODO:
        if (!idpMktName) {
          return prev;
        }

        const result = Object.assign({}, prev);
        if (!result[idpMktName]) {
          result[idpMktName] = { org: idpMktName };
        }

        const { min_ial: minIal, min_aal: minAal } = curr;

        result[idpMktName][`${minIal} ${minAal}`] = (result[idpMktName][`${minIal} ${minAal}`] || 0) + curr.price;
        return result;
      }, {});
    const rpIdpSumByOrgRows = Object.values(rpIdpSumByOrg);

    const fieldsRpIdpSummaryByOrg = [{
      label: 'Organization',
      value: 'org',
    }]
      .concat(allPriceCategories
        .idp
        .map(idpPriceCat => ({
          label: `IAL ${idpPriceCat.ial} AAL ${idpPriceCat.aal}`,
          value: row => _.round(row[`${idpPriceCat.ial} ${idpPriceCat.aal}`] || 0, 2).toFixed(2),
          default: '0.00',
          stringify: false,
        })));

    const rpIdpSumByOrgParser = new Json2csvParser({ fields: fieldsRpIdpSummaryByOrg });
    const rpIdpSumByOrgFileNameWithExt = reportFileName({
      ...reportFileNameFnBaseArg, reportIdentifier: rpMktName, rowCount: rpIdpSumByOrgRows.length, extension: 'csv',
    });
    createFile(
      rpIdpSumByOrgParser.parse(rpIdpSumByOrgRows),
      rpIdpSumByOrgFileNameWithExt,
      join(outputCsvDirPath, rpMktName, 'rp-idp-summary-by-org'),
    );
    logFileCreated(rpIdpSumByOrgFileNameWithExt, join(outputCsvDirPath, rpMktName, 'rp-idp-summary-by-org'));

    // #################################
    // RP-AS Summary by Org
    // #################################
    const rpAsSumByOrg = rpAsRows
      .reduce((prev, curr) => {
        const asMktName = curr.as_name_obj.marketing_name_en;

        // Filter null out for now, TODO:
        if (!asMktName) {
          return prev;
        }

        const result = Object.assign({}, prev);
        if (!result[asMktName]) {
          result[asMktName] = { org: asMktName };
        }

        result[asMktName][curr.service_id] =
          (result[asMktName][curr.service_id] || 0) + curr.price;
        return result;
      }, {});
    const rpAsSumByOrgRows = Object.values(rpAsSumByOrg);
    const fieldsRpAsSummaryByOrg = [{
      label: 'Organization',
      value: 'org',
    }]
      .concat(allPriceCategories
        .as
        .map(serviceId => ({
          label: serviceId,
          value: row => _.round(row[serviceId] || 0, 2).toFixed(2),
          default: '0.00',
          stringify: false,
        })));

    const rpAsSumByOrgParser = new Json2csvParser({ fields: fieldsRpAsSummaryByOrg });
    const rpAsSumByOrgFileNameWithExt = reportFileName({
      ...reportFileNameFnBaseArg, reportIdentifier: rpMktName, rowCount: rpAsSumByOrgRows.length, extension: 'csv',
    });
    createFile(
      rpAsSumByOrgParser.parse(rpAsSumByOrgRows),
      rpAsSumByOrgFileNameWithExt,
      join(outputCsvDirPath, rpMktName, 'rp-as-summary-by-org'),
    );
    logFileCreated(rpAsSumByOrgFileNameWithExt, join(outputCsvDirPath, rpMktName, 'rp-as-summary-by-org'));

    // #################################
    // RP-NDID Summary by Org
    // #################################
    const rpNdidRows = allRows.rpNdid.filter(row =>
      row.rp_name_obj.marketing_name_en === rpMktName);
    const rpNdidSumByOrg = [{
      org: rpMktName,
      numberOfTxns: rpNdidRows.length,
      ndidPrice: _.sum(rpNdidRows.map(row => row.price)),
    }];
    const rpNdidSumByOrgFileNameWithExt = reportFileName({
      ...reportFileNameFnBaseArg, reportIdentifier: rpMktName, rowCount: rpNdidSumByOrg.length, extension: 'csv',
    });
    createFile(
      rpNdidSumByOrgParser.parse(rpNdidSumByOrg),
      rpNdidSumByOrgFileNameWithExt,
      join(outputCsvDirPath, rpMktName, 'rp-ndid-summary-by-org'),
    );
    logFileCreated(rpNdidSumByOrgFileNameWithExt, join(outputCsvDirPath, rpMktName, 'rp-ndid-summary-by-org'));
  });

  nodeList.idpList.forEach(({ id, org: { marketingNameEn } }) => {
    const idpRp = [];
    allRows.rpIdp.forEach((row) => {
      if (id === row.idp_id) {
        idpRp.push(row);
      }
    });
    const csv = rpIdpParser.parse(idpRp.sort(heightCompare));
    const idpRpFileNameWithExt = reportFileName({
      ...reportFileNameFnBaseArg, reportIdentifier: id, rowCount: idpRp.length, extension: 'csv',
    });
    createFile(
      csv,
      idpRpFileNameWithExt,
      join(outputCsvDirPath, marketingNameEn, 'idp-rp'),
    );
    logFileCreated(idpRpFileNameWithExt, join(outputCsvDirPath, marketingNameEn, 'idp-rp'));

    const rpList = [];
    idpRp.forEach((item) => {
      if (!rpList.includes(item.rp_id)) {
        rpList.push(item.rp_id);
      }
    });
    genSummaryRpIdp(
      id,
      idpRp,
      rpList,
      true,
      nodeInfo,
      billPeriod,
      blockRange,
      version,
      join(outputCsvDirPath, `${marketingNameEn}/idp-rp-summary/`),
    );
  });

  // #################################
  // IdP-RP Summary by Org
  // #################################
  orgList.idpList.forEach((idpMktName) => {
    const idpRpRows = allRows.rpIdp.filter(row =>
      row.idp_name_obj.marketing_name_en === idpMktName);
    const idpRpSumByOrg = idpRpRows
      .reduce((prev, curr) => {
        const rpMktName = curr.rp_name_obj.marketing_name_en;

        // Filter null out for now, TODO:
        if (!rpMktName) {
          return prev;
        }

        const result = Object.assign({}, prev);
        if (!result[rpMktName]) {
          result[rpMktName] = { org: rpMktName };
        }

        const { ial, aal } = curr;

        result[rpMktName][`${ial} ${aal}`] = (result[rpMktName][`${ial} ${aal}`] || 0) + curr.price;
        return result;
      }, {});
    const idpRpSumByOrgRows = Object.values(idpRpSumByOrg);

    const fieldsIdpRpSummaryByOrg = [{
      label: 'Organization',
      value: 'org',
    }]
      .concat(allPriceCategories
        .idp
        .map(idpPriceCat => ({
          label: `IAL ${idpPriceCat.ial} AAL ${idpPriceCat.aal}`,
          value: row => _.round(row[`${idpPriceCat.ial} ${idpPriceCat.aal}`] || 0, 2).toFixed(2),
          default: '0.00',
          stringify: false,
        })));

    const idpRpSumByOrgParser = new Json2csvParser({ fields: fieldsIdpRpSummaryByOrg });
    const idpRpSumByOrgFileNameWithExt = reportFileName({
      ...reportFileNameFnBaseArg, reportIdentifier: idpMktName, rowCount: idpRpSumByOrgRows.length, extension: 'csv',
    });
    createFile(
      idpRpSumByOrgParser.parse(idpRpSumByOrgRows),
      idpRpSumByOrgFileNameWithExt,
      join(outputCsvDirPath, idpMktName, 'idp-rp-summary-by-org'),
    );
    logFileCreated(idpRpSumByOrgFileNameWithExt, join(outputCsvDirPath, idpMktName, 'idp-rp-summary-by-org'));
  });

  nodeList.rpList.forEach(({ id, org: { marketingNameEn } }) => {
    const rpAs = [];
    allRows.rpAs.forEach((row) => {
      if (id === row.rp_id) {
        rpAs.push(row);
      }
    });
    const csv = rpAsParser.parse(rpAs.sort(heightCompare));
    const rpAsFileNameWithExt = reportFileName({
      ...reportFileNameFnBaseArg, reportIdentifier: id, rowCount: csv.length, extension: 'csv',
    });
    createFile(
      csv,
      rpAsFileNameWithExt,
      join(outputCsvDirPath, marketingNameEn, 'rp-as'),
    );
    logFileCreated(rpAsFileNameWithExt, join(outputCsvDirPath, marketingNameEn, 'rp-as'));

    const asList = [];
    rpAs.forEach((item) => {
      const as = {
        asId: item.as_id,
        serviceId: item.service_id,
      };
      if ((asList.findIndex(data => JSON.stringify(data) === JSON.stringify(as))) === -1) {
        asList.push(as);
      }
    });
    genSummaryRpAs(
      id,
      rpAs,
      asList,
      false,
      nodeInfo,
      billPeriod,
      blockRange,
      version,
      join(outputCsvDirPath, marketingNameEn, 'rp-as-summary'),
    );
  });

  nodeList.asList.forEach(({ id, org: { marketingNameEn } }) => {
    const asRp = [];
    allRows.rpAs.forEach((row) => {
      if (id === row.as_id) {
        asRp.push(row);
      }
    });
    const csv = rpAsParser.parse(asRp.sort(heightCompare));
    const asRpFileNameWithExt = reportFileName({
      ...reportFileNameFnBaseArg, reportIdentifier: id, rowCount: asRp.length, extension: 'csv',
    });
    createFile(
      csv,
      asRpFileNameWithExt,
      join(outputCsvDirPath, marketingNameEn, 'as-rp'),
    );
    logFileCreated(asRpFileNameWithExt, join(outputCsvDirPath, marketingNameEn, 'as-rp'));

    const asList = [];
    asRp.forEach((item) => {
      const as = {
        rpId: item.rp_id,
        serviceId: item.service_id,
      };
      if ((asList.findIndex(data => JSON.stringify(data) === JSON.stringify(as))) === -1) {
        asList.push(as);
      }
    });
    genSummaryRpAs(
      id,
      asRp,
      asList,
      true,
      nodeInfo,
      billPeriod,
      blockRange,
      version,
      join(outputCsvDirPath, marketingNameEn, 'as-rp-summary'),
    );
  });

  // #################################
  // AS-RP Summary by Org
  // #################################
  orgList.asList.forEach((asMktName) => {
    const asRpRows = allRows.rpAs.filter(row =>
      row.as_name_obj.marketing_name_en === asMktName);
    const asRpSumByOrg = asRpRows
      .reduce((prev, curr) => {
        const rpMktName = curr.rp_name_obj.marketing_name_en;

        // Filter null out for now, TODO:
        if (!rpMktName) {
          return prev;
        }

        const result = Object.assign({}, prev);
        if (!result[rpMktName]) {
          result[rpMktName] = { org: rpMktName };
        }

        result[rpMktName][curr.service_id] =
          (result[rpMktName][curr.service_id] || 0) + curr.price;
        return result;
      }, {});
    const asRpSumByOrgRows = Object.values(asRpSumByOrg);
    const fieldsAsRpSummaryByOrg = [{
      label: 'Organization',
      value: 'org',
    }]
      .concat(allPriceCategories
        .as
        .map(serviceId => ({
          label: serviceId,
          value: row => _.round(row[serviceId] || 0, 2).toFixed(2),
          default: '0.00',
          stringify: false,
        })));

    const asRpSumByOrgParser = new Json2csvParser({ fields: fieldsAsRpSummaryByOrg });
    const asRpSumByOrgFileNameWithExt = reportFileName({
      ...reportFileNameFnBaseArg, reportIdentifier: asMktName, rowCount: asRpSumByOrgRows.length, extension: 'csv',
    });
    createFile(
      asRpSumByOrgParser.parse(asRpSumByOrgRows),
      asRpSumByOrgFileNameWithExt,
      join(outputCsvDirPath, asMktName, 'as-rp-summary-by-org'),
    );
    logFileCreated(asRpSumByOrgFileNameWithExt, join(outputCsvDirPath, asMktName, 'as-rp-summary-by-org'));
  });

  // #################################
  // Summary by Org
  // #################################
  genSummaryByOrgReport(allRows, orgList, billPeriod, blockRange, version, outputCsvDirPath);
}

module.exports.genCSV = genCSV;
