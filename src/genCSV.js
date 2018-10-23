// App code here

// const value = require('./expected1');
const Json2csvParser = require('json2csv').Parser;

const _ = require('lodash');
const fs = require('fs');
const mkpath = require('mkpath');
const { join } = require('path');

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
    value: 'ial',
  }, {
    label: 'Requested AAL',
    value: 'aal',
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
    label: 'Request ID',
    value: 'request_id',
  }, {
    label: 'Request Status',
    value: 'status',
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
    label: 'Requested IAL',
    value: 'ial',
  }, {
    label: 'Requested AAL',
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
    value: 'price',
  }, {
    label: 'IdP Full Price',
    value: 'full_price',
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
    label: 'IdP Node ID',
    value: 'idpId',
  }, {
    label: 'IdP Node Name',
    value: 'idpName',
  }, {
    label: 'IdP Price',
    value: 'idpPrice',
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
    label: 'Request ID',
    value: 'request_id',
  }, {
    label: 'Request Status',
    value: 'status',
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
    value: 'price',
  }, {
    label: 'AS Full Price',
    value: 'full_price',
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
    label: 'AS Node ID',
    value: 'asId',
  }, {
    label: 'AS Node Name',
    value: 'asName',
  }, {
    label: 'AS Service ID',
    value: 'serviceId',
  }, {
    label: 'AS Price',
    value: 'asPrice',
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
    label: 'Request ID',
    value: 'request_id',
  }, {
    label: 'Request Status',
    value: 'status',
  }, {
    label: 'Created Block Height',
    value: 'height',
  }, {
    label: 'Mode',
    value: 'mode',
  }, {
    label: 'NDID Price',
    value: 'price',
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
    label: 'NDID Price',
    value: 'ndidPrice',
  },
];

const pendingParser = new Json2csvParser({ fields: fieldsPending });

const rpIdpParser = new Json2csvParser({ fields: fieldsRpIdp });
const rpIdpSumParser = new Json2csvParser({ fields: fieldsRpIdpSummary });

const rpAsParser = new Json2csvParser({ fields: fieldsRpAs });
const rpAsSumParser = new Json2csvParser({ fields: fieldsRpAsSummary });

const rpNdidParser = new Json2csvParser({ fields: fieldsRpNdid });
const rpNdidSumParser = new Json2csvParser({ fields: fieldsRpNdidSummary });

function heightCompare(rowA, rowB) {
  return rowA.height - rowB.height;
}

function getNodeName(aNodeInfo = {}) {
  return aNodeInfo.node_name;
}

function getNodeNames(nodeInfo, nodeIds) {
  return nodeIds.map(id => getNodeName(nodeInfo[id])).join(', ');
}

function genRowsFromPendingRequest(req, nodeInfo) {
  const { detail, settlement } = req;

  const rows = (detail.data_request_list.length > 0 ? detail.data_request_list : [{}])
    .map(({ as_id_list = [], service_id = '' }) => ({
      rp_id: settlement.requester_node_id,
      rp_name: getNodeName(nodeInfo[settlement.requester_node_id]),
      request_id: settlement.request_id,
      status: settlement.status,
      height: settlement.height,
      mode: settlement.mode,
      idp_ids: detail.idp_id_list.join(', '),
      idp_names: getNodeNames(nodeInfo, detail.idp_id_list),
      ial: detail.min_ial,
      aal: detail.min_aal,
      service_id,
      as_ids: as_id_list.join(', '),
      as_names: getNodeNames(nodeInfo, as_id_list),
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
    request.request_id = settlement.request_id;
    request.status = settlement.status;
    request.height = settlement.height;
    request.mode = settlement.mode;
    request.idp_id = item.idp_id;
    request.idp_name = getNodeName(nodeInfo[item.idp_id]);
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

    request.price = _.round(item.idp_price, 6);
    request.full_price = _.round(item.idp_full_price, 6);

    rpIdp.push(request);
  });

  const rpAs = [];
  settlement.asList.forEach((item) => {
    const request = {};
    request.rp_id = settlement.requester_node_id;
    request.rp_name = getNodeName(nodeInfo[settlement.requester_node_id]);
    request.request_id = settlement.request_id;
    request.status = settlement.status;
    request.height = settlement.height;
    request.mode = settlement.mode;
    request.as_id = item.as_id;
    request.as_name = getNodeName(nodeInfo[item.as_id]);
    request.service_id = item.service_id;
    request.data_answered = item.data_answered ? 'Yes' : 'No';
    request.data_received = item.data_received ? 'Yes' : 'No';
    request.price = _.round(item.as_price, 6);
    request.full_price = _.round(item.as_full_price, 6);

    rpAs.push(request);
  });

  const rpNdid = [{
    rp_id: settlement.requester_node_id,
    rp_name: getNodeName(nodeInfo[settlement.requester_node_id]),
    request_id: settlement.request_id,
    status: settlement.status,
    height: settlement.height,
    mode: settlement.mode,
    price: NDID_PRICE_PER_REQ,
  }];

  return {
    rpIdp,
    rpAs,
    rpNdid,
  };
}

function getNodeList(allRows) {
  const rpList = [];
  const idpList = [];
  const asList = [];
  allRows.rpIdp.forEach((item) => {
    if (!rpList.includes(item.rp_id)) {
      rpList.push(item.rp_id);
    }
    if (!idpList.includes(item.idp_id)) {
      idpList.push(item.idp_id);
    }
  });
  allRows.rpAs.forEach((item) => {
    if (!asList.includes(item.as_id)) {
      asList.push(item.as_id);
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

function genSummaryRpIdp(path, requests, nodeIdList, nodeInfo, outputDirPath) {
  const summary = [];
  nodeIdList.forEach((id) => {
    const filter = requests.filter(item => item.idp_id === id);
    const sum = filter.reduce((prev, curr) => ({
      rpId: curr.rp_id,
      rpName: getNodeName(nodeInfo[curr.rp_id]),
      idpId: curr.idp_id,
      idpName: getNodeName(nodeInfo[curr.idp_id]),
      idpPrice: prev.idpPrice + curr.price,
    }), {
      idpPrice: 0,
    });
    sum.idpPrice = _.round(sum.idpPrice, 6);
    summary.push(sum);
  });
  const sumCsv = rpIdpSumParser.parse(summary);
  createFile(sumCsv, path, outputDirPath);
}

function genSummaryRpAs(path, requests, checkDataList, checkRp, nodeInfo, outputDirPath) {
  const summary = [];
  checkDataList.forEach((checkData) => {
    const filter = requests.filter((item) => {
      if (checkRp) {
        return checkData.rpId === item.rp_id && checkData.serviceId === item.service_id;
      }
      return checkData.asId === item.as_id && checkData.serviceId === item.service_id;
    });
    const sumRpAs = filter.reduce((prev, curr) => ({
      rpId: curr.rp_id,
      rpName: getNodeName(nodeInfo[curr.rp_id]),
      asId: curr.as_id,
      asName: getNodeName(nodeInfo[curr.as_id]),
      serviceId: curr.service_id,
      asPrice: prev.asPrice + curr.price,
    }), {
      asPrice: 0,
    });
    sumRpAs.asPrice = _.round(sumRpAs.asPrice, 6);
    summary.push(sumRpAs);
  });
  const sumCsv = rpAsSumParser.parse(summary);
  createFile(sumCsv, path, outputDirPath);
}

function genSummaryRpNdid(path, requests, rpId, nodeInfo, outputDirPath) {
  const summary = [
    requests
      .filter(req => req.rp_id === rpId)
      .reduce((prev, curr) => ({
        rpId: curr.rp_id,
        rpName: getNodeName(nodeInfo[curr.rp_id]),
        ndidPrice: prev.ndidPrice + curr.price,
      }), {
        ndidPrice: 0,
      }),
  ].map(item => ({ ...item, ndidPrice: _.round(item.ndidPrice, 6) }));

  const sumCsv = rpNdidSumParser.parse(summary);
  createFile(sumCsv, path, outputDirPath);
}

function genCSV(settlementWithPrice, pendingRequests, nodeInfo, outputDirPath) {
  const allPendingReqIds = Object.keys(pendingRequests);
  const allPendingReqRows = allPendingReqIds
    .map(reqId => genRowsFromPendingRequest(pendingRequests[reqId], nodeInfo))
    .reduce((prev, curr) => prev.concat(curr), []);
  createFile(pendingParser.parse(allPendingReqRows.sort(heightCompare)), 'csv/pending.csv', outputDirPath);

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

  nodeList.rpList.forEach((id) => {
    const rpIdp = [];
    allRows.rpIdp.forEach((row) => {
      if (id === row.rp_id) {
        rpIdp.push(row);
      }
    });
    const csv = rpIdpParser.parse(rpIdp.sort(heightCompare));
    createFile(csv, `csv/rp-idp/${id}.csv`, outputDirPath);

    const idp = [];
    rpIdp.forEach((item) => {
      if (!idp.includes(item.idp_id)) {
        idp.push(item.idp_id);
      }
    });
    genSummaryRpIdp(`csv/rp-idp-summary/${id}.csv`, rpIdp, idp, nodeInfo, outputDirPath);

    const rpNdidCsv = rpNdidParser.parse(allRows.rpNdid.filter(row => id === row.rp_id).sort(heightCompare));
    createFile(rpNdidCsv, `csv/rp-ndid/${id}.csv`, outputDirPath);

    genSummaryRpNdid(`csv/rp-ndid-summary/${id}.csv`, allRows.rpNdid, id, nodeInfo, outputDirPath);
  });

  nodeList.idpList.forEach((id) => {
    const idpRp = [];
    allRows.rpIdp.forEach((row) => {
      if (id === row.idp_id) {
        idpRp.push(row);
      }
    });
    const csv = rpIdpParser.parse(idpRp.sort(heightCompare));
    createFile(csv, `csv/idp-rp/${id}.csv`, outputDirPath);

    const rp = [];
    idpRp.forEach((item) => {
      if (!rp.includes(item.idp_id)) {
        rp.push(item.idp_id);
      }
    });
    genSummaryRpIdp(`csv/idp-rp-summary/${id}.csv`, idpRp, rp, nodeInfo, outputDirPath);
  });

  nodeList.rpList.forEach((id) => {
    const rpAs = [];
    allRows.rpAs.forEach((row) => {
      if (id === row.rp_id) {
        rpAs.push(row);
      }
    });
    const csv = rpAsParser.parse(rpAs.sort(heightCompare));
    createFile(csv, `csv/rp-as/${id}.csv`, outputDirPath);

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
    genSummaryRpAs(`csv/rp-as-summary/${id}.csv`, rpAs, asList, false, nodeInfo, outputDirPath);
  });

  nodeList.asList.forEach((id) => {
    const asRp = [];
    allRows.rpAs.forEach((row) => {
      if (id === row.as_id) {
        asRp.push(row);
      }
    });
    const csv = rpAsParser.parse(asRp.sort(heightCompare));
    createFile(csv, `csv/as-rp/${id}.csv`, outputDirPath);

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
    genSummaryRpAs(`csv/as-rp-summary/${id}.csv`, asRp, asList, true, nodeInfo, outputDirPath);
  });
}

module.exports.genCSV = genCSV;
