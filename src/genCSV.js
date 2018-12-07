// App code here

// const value = require('./expected1');
const Json2csvParser = require('json2csv').Parser;

const _ = require('lodash');
const fs = require('fs');
const mkpath = require('mkpath');
const { join } = require('path');
const { genSummaryByOrgReport } = require('./genSummaryByOrgReport');

const NDID_PRICE_PER_REQ = 5;

const fieldsPending = [
  {
    label: 'RP Node ID',
    value: 'rp_id',
  }, {
    label: 'RP Node Name',
    value: 'rp_name',
  }, {
    label: 'Request ID',
    value: 'request_id',
  }, {
    label: 'Request Status',
    value: 'status',
  }, {
    label: 'Closed',
    value: 'closed',
  }, {
    label: 'Timed out',
    value: 'timed_out',
  }, {
    label: 'Created Block Height',
    value: 'height',
  }, {
    label: 'Mode',
    value: 'mode',
  }, {
    label: 'IdP Node IDs',
    value: 'idp_ids',
  }, {
    label: 'IdP Node Names',
    value: 'idp_names',
  }, {
    label: 'Requested IAL',
    value: 'min_ial',
  }, {
    label: 'Requested AAL',
    value: 'min_aal',
  }, {
    label: 'AS Service ID',
    value: 'service_id',
  }, {
    label: 'AS Node IDs',
    value: 'as_ids',
  }, {
    label: 'AS Node Names',
    value: 'as_names',
  },
];

const fieldsRpIdp = [
  {
    label: 'RP Node ID',
    value: 'rp_id',
  },
  {
    label: 'RP Node Name',
    value: 'rp_name',
  },
  {
    label: 'RP Node Industry Code',
    value: row => row.rp_name_obj.industry_code,
  },
  {
    label: 'RP Node Company Code',
    value: row => row.rp_name_obj.company_code,
  },
  {
    label: 'RP Node Marketing Name TH',
    value: row => row.rp_name_obj.marketing_name_th,
  },
  {
    label: 'RP Node Marketing Name EN',
    value: row => row.rp_name_obj.marketing_name_en,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name TH',
    value: row => row.rp_name_obj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name EN',
    value: row => row.rp_name_obj.proxy_or_subsidiary_name_en,
  },
  {
    label: 'Request ID',
    value: 'request_id',
  }, {
    label: 'Request Status',
    value: 'status',
  }, {
    label: 'Closed',
    value: 'closed',
  }, {
    label: 'Timed out',
    value: 'timed_out',
  }, {
    label: 'Created Block Height',
    value: 'height',
  }, {
    label: 'Mode',
    value: 'mode',
  }, {
    label: 'IdP Node ID',
    value: 'idp_id',
  }, {
    label: 'IdP Node Name',
    value: 'idp_name',
  }, {
    label: 'IdP Node Industry Code',
    value: row => row.idp_name_obj.industry_code,
  },
  {
    label: 'IdP Node Company Code',
    value: row => row.idp_name_obj.company_code,
  },
  {
    label: 'IdP Node Marketing Name TH',
    value: row => row.idp_name_obj.marketing_name_th,
  },
  {
    label: 'IdP Node Marketing Name EN',
    value: row => row.idp_name_obj.marketing_name_en,
  },
  {
    label: 'IdP Node Proxy or Subsidiary Name TH',
    value: row => row.idp_name_obj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'IdP Node Proxy or Subsidiary Name EN',
    value: row => row.idp_name_obj.proxy_or_subsidiary_name_en,
  }, {
    label: 'Requested IAL',
    value: 'min_ial',
  }, {
    label: 'Requested AAL',
    value: 'min_aal',
  }, {
    label: 'Response IAL',
    value: 'ial',
  }, {
    label: 'Response AAL',
    value: 'aal',
  }, {
    label: 'IdP Response',
    value: 'response',
  }, {
    label: 'Valid IdP Response Signature',
    value: 'valid_idp_response_signature',
  }, {
    label: 'Valid IdP Response IAL',
    value: 'valid_idp_response_ial',
  }, {
    label: 'IdP Price',
    value: row => row.price.toFixed(2),
    stringify: false,
  }, {
    label: 'IdP Full Price',
    value: row => row.full_price.toFixed(2),
    stringify: false,
  },
];
const fieldsRpIdpSummary = [
  {
    label: 'RP Node ID',
    value: 'rpId',
  }, {
    label: 'RP Node Name',
    value: 'rpName',
  }, {
    label: 'RP Node Industry Code',
    value: row => row.rpNameObj.industry_code,
  },
  {
    label: 'RP Node Company Code',
    value: row => row.rpNameObj.company_code,
  },
  {
    label: 'RP Node Marketing Name TH',
    value: row => row.rpNameObj.marketing_name_th,
  },
  {
    label: 'RP Node Marketing Name EN',
    value: row => row.rpNameObj.marketing_name_en,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name TH',
    value: row => row.rpNameObj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name EN',
    value: row => row.rpNameObj.proxy_or_subsidiary_name_en,
  }, {
    label: 'IdP Node ID',
    value: 'idpId',
  }, {
    label: 'IdP Node Name',
    value: 'idpName',
  }, {
    label: 'IdP Node Industry Code',
    value: row => row.idpNameObj.industry_code,
  },
  {
    label: 'IdP Node Company Code',
    value: row => row.idpNameObj.company_code,
  },
  {
    label: 'IdP Node Marketing Name TH',
    value: row => row.idpNameObj.marketing_name_th,
  },
  {
    label: 'IdP Node Marketing Name EN',
    value: row => row.idpNameObj.marketing_name_en,
  },
  {
    label: 'IdP Node Proxy or Subsidiary Name TH',
    value: row => row.idpNameObj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'IdP Node Proxy or Subsidiary Name EN',
    value: row => row.idpNameObj.proxy_or_subsidiary_name_en,
  }, {
    label: 'IdP Price',
    value: row => row.idpPrice.toFixed(2),
    stringify: false,
  },
];

const fieldsRpAs = [
  {
    label: 'RP Node ID',
    value: 'rp_id',
  }, {
    label: 'RP Node Name',
    value: 'rp_name',
  }, {
    label: 'RP Node Industry Code',
    value: row => row.rp_name_obj.industry_code,
  },
  {
    label: 'RP Node Company Code',
    value: row => row.rp_name_obj.company_code,
  },
  {
    label: 'RP Node Marketing Name TH',
    value: row => row.rp_name_obj.marketing_name_th,
  },
  {
    label: 'RP Node Marketing Name EN',
    value: row => row.rp_name_obj.marketing_name_en,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name TH',
    value: row => row.rp_name_obj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name EN',
    value: row => row.rp_name_obj.proxy_or_subsidiary_name_en,
  }, {
    label: 'Request ID',
    value: 'request_id',
  }, {
    label: 'Request Status',
    value: 'status',
  }, {
    label: 'Closed',
    value: 'closed',
  }, {
    label: 'Timed out',
    value: 'timed_out',
  }, {
    label: 'Created Block Height',
    value: 'height',
  }, {
    label: 'Mode',
    value: 'mode',
  }, {
    label: 'AS Node ID',
    value: 'as_id',
  }, {
    label: 'AS Node Name',
    value: 'as_name',
  }, {
    label: 'AS Node Industry Code',
    value: row => row.as_name_obj.industry_code,
  },
  {
    label: 'AS Node Company Code',
    value: row => row.as_name_obj.company_code,
  },
  {
    label: 'AS Node Marketing Name TH',
    value: row => row.as_name_obj.marketing_name_th,
  },
  {
    label: 'AS Node Marketing Name EN',
    value: row => row.as_name_obj.marketing_name_en,
  },
  {
    label: 'AS Node Proxy or Subsidiary Name TH',
    value: row => row.as_name_obj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'AS Node Proxy or Subsidiary Name EN',
    value: row => row.as_name_obj.proxy_or_subsidiary_name_en,
  }, {
    label: 'AS Service ID',
    value: 'service_id',
  }, {
    label: 'Data Answered',
    value: 'data_answered',
  }, {
    label: 'Data Received',
    value: 'data_received',
  }, {
    label: 'AS Price',
    value: row => row.price.toFixed(2),
    stringify: false,
  }, {
    label: 'AS Full Price',
    value: row => row.full_price.toFixed(2),
    stringify: false,
  },
];
const fieldsRpAsSummary = [
  {
    label: 'RP Node ID',
    value: 'rpId',
  }, {
    label: 'RP Node Name',
    value: 'rpName',
  }, {
    label: 'RP Node Industry Code',
    value: row => row.rpNameObj.industry_code,
  },
  {
    label: 'RP Node Company Code',
    value: row => row.rpNameObj.company_code,
  },
  {
    label: 'RP Node Marketing Name TH',
    value: row => row.rpNameObj.marketing_name_th,
  },
  {
    label: 'RP Node Marketing Name EN',
    value: row => row.rpNameObj.marketing_name_en,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name TH',
    value: row => row.rpNameObj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name EN',
    value: row => row.rpNameObj.proxy_or_subsidiary_name_en,
  }, {
    label: 'AS Node ID',
    value: 'asId',
  }, {
    label: 'AS Node Name',
    value: 'asName',
  }, {
    label: 'AS Node Industry Code',
    value: row => row.asNameObj.industry_code,
  },
  {
    label: 'AS Node Company Code',
    value: row => row.asNameObj.company_code,
  },
  {
    label: 'AS Node Marketing Name TH',
    value: row => row.asNameObj.marketing_name_th,
  },
  {
    label: 'AS Node Marketing Name EN',
    value: row => row.asNameObj.marketing_name_en,
  },
  {
    label: 'AS Node Proxy or Subsidiary Name TH',
    value: row => row.asNameObj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'AS Node Proxy or Subsidiary Name EN',
    value: row => row.asNameObj.proxy_or_subsidiary_name_en,
  }, {
    label: 'AS Service ID',
    value: 'serviceId',
  }, {
    label: 'AS Price',
    value: row => row.asPrice.toFixed(2),
    stringify: false,
  },
];

const fieldsRpNdid = [
  {
    label: 'RP Node ID',
    value: 'rp_id',
  }, {
    label: 'RP Node Name',
    value: 'rp_name',
  }, {
    label: 'RP Node Industry Code',
    value: row => row.rp_name_obj.industry_code,
  },
  {
    label: 'RP Node Company Code',
    value: row => row.rp_name_obj.company_code,
  },
  {
    label: 'RP Node Marketing Name TH',
    value: row => row.rp_name_obj.marketing_name_th,
  },
  {
    label: 'RP Node Marketing Name EN',
    value: row => row.rp_name_obj.marketing_name_en,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name TH',
    value: row => row.rp_name_obj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name EN',
    value: row => row.rp_name_obj.proxy_or_subsidiary_name_en,
  }, {
    label: 'Request ID',
    value: 'request_id',
  }, {
    label: 'Request Status',
    value: 'status',
  }, {
    label: 'Closed',
    value: 'closed',
  }, {
    label: 'Timed out',
    value: 'timed_out',
  }, {
    label: 'Created Block Height',
    value: 'height',
  }, {
    label: 'Mode',
    value: 'mode',
  }, {
    label: 'NDID Price',
    value: row => row.price.toFixed(2),
    stringify: false,
  },
];
const fieldsRpNdidSummary = [
  {
    label: 'RP Node ID',
    value: 'rpId',
  }, {
    label: 'RP Node Name',
    value: 'rpName',
  }, {
    label: 'RP Node Industry Code',
    value: row => row.rpNameObj.industry_code,
  },
  {
    label: 'RP Node Company Code',
    value: row => row.rpNameObj.company_code,
  },
  {
    label: 'RP Node Marketing Name TH',
    value: row => row.rpNameObj.marketing_name_th,
  },
  {
    label: 'RP Node Marketing Name EN',
    value: row => row.rpNameObj.marketing_name_en,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name TH',
    value: row => row.rpNameObj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name EN',
    value: row => row.rpNameObj.proxy_or_subsidiary_name_en,
  }, {
    label: 'Number of Transactions',
    value: 'numberOfTxns',
  }, {
    label: 'NDID Price',
    value: row => row.ndidPrice.toFixed(2),
    stringify: false,
  },
];
const fieldsRpNdidSummaryByOrg = [
  {
    label: 'Organization',
    value: 'org',
  }, {
    label: 'Number of Transactions',
    value: 'numberOfTxns',
  }, {
    label: 'NDID Price',
    value: row => row.ndidPrice.toFixed(2),
    stringify: false,
  },
];

const pendingParser = new Json2csvParser({ fields: fieldsPending });

const rpIdpParser = new Json2csvParser({ fields: fieldsRpIdp });
const rpIdpSumParser = new Json2csvParser({ fields: fieldsRpIdpSummary });

const rpAsParser = new Json2csvParser({ fields: fieldsRpAs });
const rpAsSumParser = new Json2csvParser({ fields: fieldsRpAsSummary });

const rpNdidParser = new Json2csvParser({ fields: fieldsRpNdid });
const rpNdidSumParser = new Json2csvParser({ fields: fieldsRpNdidSummary });
const rpNdidSumByOrgParser = new Json2csvParser({ fields: fieldsRpNdidSummaryByOrg });


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

function genSummaryRpIdp(path, requests, nodeIdList, checkRp, nodeInfo, outputDirPath) {
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
  createFile(sumCsv, path, outputDirPath);
}

function genSummaryRpAs(path, requests, checkDataList, checkRp, nodeInfo, outputDirPath) {
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
  createFile(sumCsv, path, outputDirPath);
}

function genSummaryRpNdid(path, requests, rpId, nodeInfo, outputDirPath) {
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
  createFile(sumCsv, path, outputDirPath);
}

function genCSV(
  settlementWithPrice,
  pendingRequests,
  nodeInfo,
  allPriceCategories,
  billPeriod,
  outputDirPath,
) {
  const allPendingReqIds = Object.keys(pendingRequests);
  const allPendingReqRows = allPendingReqIds
    .map(reqId => genRowsFromPendingRequest(pendingRequests[reqId], nodeInfo))
    .reduce((prev, curr) => prev.concat(curr), []);
  createFile(pendingParser.parse(allPendingReqRows.sort(heightCompare)), 'csv/pending.csv', outputDirPath);
  console.log(`pending.csv created at ${join(outputDirPath, 'csv')}`);

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
    createFile(csv, `csv/${marketingNameEn}/rp-idp/${id}.csv`, outputDirPath);
    console.log(`${id}.csv created at ${join(outputDirPath, 'csv', marketingNameEn, 'rp-idp')}`);

    const idpList = [];
    rpIdp.forEach((item) => {
      if (!idpList.includes(item.idp_id)) {
        idpList.push(item.idp_id);
      }
    });
    genSummaryRpIdp(`csv/${marketingNameEn}/rp-idp-summary/${id}.csv`, rpIdp, idpList, false, nodeInfo, outputDirPath);
    console.log(`${id}.csv created at ${join(outputDirPath, 'csv', marketingNameEn, 'rp-idp-summary')}`);

    const rpNdidCsv = rpNdidParser
      .parse(allRows.rpNdid.filter(row => id === row.rp_id).sort(heightCompare));
    createFile(rpNdidCsv, `csv/${marketingNameEn}/rp-ndid/${id}.csv`, outputDirPath);
    console.log(`${id}.csv created at ${join(outputDirPath, 'csv', marketingNameEn, 'rp-ndid')}`);

    genSummaryRpNdid(`csv/${marketingNameEn}/rp-ndid-summary/${id}.csv`, allRows.rpNdid, id, nodeInfo, outputDirPath);
    console.log(`${id}.csv created at ${join(outputDirPath, 'csv', marketingNameEn, 'rp-ndid-summary')}`);
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
    createFile(csv, `csv/${rpMktName}/rp-summary-by-org/${rpMktName}.csv`, outputDirPath);
    console.log(`${rpMktName}.csv created at ${join(outputDirPath, 'csv', rpMktName, 'rp-summary-by-org')}`);

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
    createFile(rpIdpSumByOrgParser.parse(rpIdpSumByOrgRows), `csv/${rpMktName}/rp-idp-summary-by-org/${rpMktName}.csv`, outputDirPath);
    console.log(`${rpMktName}.csv created at ${join(outputDirPath, 'csv', rpMktName, 'rp-idp-summary-by-org')}`);

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
    createFile(rpAsSumByOrgParser.parse(rpAsSumByOrgRows), `csv/${rpMktName}/rp-as-summary-by-org/${rpMktName}.csv`, outputDirPath);
    console.log(`${rpMktName}.csv created at ${join(outputDirPath, 'csv', rpMktName, 'rp-as-summary-by-org')}`);

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
    createFile(rpNdidSumByOrgParser.parse(rpNdidSumByOrg), `csv/${rpMktName}/rp-ndid-summary-by-org/${rpMktName}.csv`, outputDirPath);
    console.log(`${rpMktName}.csv created at ${join(outputDirPath, 'csv', rpMktName, 'rp-ndid-summary-by-org')}`);
  });

  nodeList.idpList.forEach(({ id, org: { marketingNameEn } }) => {
    const idpRp = [];
    allRows.rpIdp.forEach((row) => {
      if (id === row.idp_id) {
        idpRp.push(row);
      }
    });
    const csv = rpIdpParser.parse(idpRp.sort(heightCompare));
    createFile(csv, `csv/${marketingNameEn}/idp-rp/${id}.csv`, outputDirPath);
    console.log(`${id}.csv created at ${join(outputDirPath, 'csv', marketingNameEn, 'idp-rp')}`);

    const rpList = [];
    idpRp.forEach((item) => {
      if (!rpList.includes(item.rp_id)) {
        rpList.push(item.rp_id);
      }
    });
    genSummaryRpIdp(`csv/${marketingNameEn}/idp-rp-summary/${id}.csv`, idpRp, rpList, true, nodeInfo, outputDirPath);
    console.log(`${id}.csv created at ${join(outputDirPath, 'csv', marketingNameEn, 'idp-rp-summary')}`);
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
    createFile(idpRpSumByOrgParser.parse(idpRpSumByOrgRows), `csv/${idpMktName}/idp-rp-summary-by-org/${idpMktName}.csv`, outputDirPath);
    console.log(`${idpMktName}.csv created at ${join(outputDirPath, 'csv', idpMktName, 'idp-rp-summary-by-org')}`);
  });

  nodeList.rpList.forEach(({ id, org: { marketingNameEn } }) => {
    const rpAs = [];
    allRows.rpAs.forEach((row) => {
      if (id === row.rp_id) {
        rpAs.push(row);
      }
    });
    const csv = rpAsParser.parse(rpAs.sort(heightCompare));
    createFile(csv, `csv/${marketingNameEn}/rp-as/${id}.csv`, outputDirPath);
    console.log(`${id}.csv created at ${join(outputDirPath, 'csv', marketingNameEn, 'rp-as')}`);

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
    genSummaryRpAs(`csv/${marketingNameEn}/rp-as-summary/${id}.csv`, rpAs, asList, false, nodeInfo, outputDirPath);
    console.log(`${id}.csv created at ${join(outputDirPath, 'csv', marketingNameEn, 'rp-as-summary')}`);
  });

  nodeList.asList.forEach(({ id, org: { marketingNameEn } }) => {
    const asRp = [];
    allRows.rpAs.forEach((row) => {
      if (id === row.as_id) {
        asRp.push(row);
      }
    });
    const csv = rpAsParser.parse(asRp.sort(heightCompare));
    createFile(csv, `csv/${marketingNameEn}/as-rp/${id}.csv`, outputDirPath);
    console.log(`${id}.csv created at ${join(outputDirPath, 'csv', marketingNameEn, 'as-rp')}`);

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
    genSummaryRpAs(`csv/${marketingNameEn}/as-rp-summary/${id}.csv`, asRp, asList, true, nodeInfo, outputDirPath);
    console.log(`${id}.csv created at ${join(outputDirPath, 'csv', marketingNameEn, 'as-rp-summary')}`);
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
    createFile(asRpSumByOrgParser.parse(asRpSumByOrgRows), `csv/${asMktName}/as-rp-summary-by-org/${asMktName}.csv`, outputDirPath);
    console.log(`${asMktName}.csv created at ${join(outputDirPath, 'csv', asMktName, 'as-rp-summary-by-org')}`);
  });

  // #################################
  // Summary by Org
  // #################################
  genSummaryByOrgReport(allRows, orgList, billPeriod, outputDirPath);
}

module.exports.genCSV = genCSV;
