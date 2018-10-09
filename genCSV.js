// App code here

// const value = require('./expected1');
const Json2csvParser = require('json2csv').Parser;

const fs = require('fs');
const mkpath = require('mkpath');
const { join } = require('path');

const fieldsRpIdp = [
  {
    label: 'RP Node ID',
    value: 'rp_id',
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
    label: 'IdP Node ID',
    value: 'idp_id',
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
    label: 'IdP Node ID',
    value: 'idpId',
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
    label: 'Request ID',
    value: 'request_id',
  }, {
    label: 'Request Status',
    value: 'status',
  }, {
    label: 'Created Block Height',
    value: 'height',
  }, {
    label: 'AS Node ID',
    value: 'as_id',
  }, {
    label: 'AS Service ID',
    value: 'service_id',
  }, {
    label: 'AS Price',
    value: 'price',
  },
];
const fieldsRpAsSummary = [
  {
    label: 'RP Node ID',
    value: 'rpId',
  }, {
    label: 'AS Node ID',
    value: 'asId',
  }, {
    label: 'AS Service ID',
    value: 'serviceId',
  }, {
    label: 'AS Price',
    value: 'asPrice',
  },
];

const rpIdpParser = new Json2csvParser({ fields: fieldsRpIdp });
const rpIdpSumParser = new Json2csvParser({ fields: fieldsRpIdpSummary });

const rpAsParser = new Json2csvParser({ fields: fieldsRpAs });
const rpAsSumParser = new Json2csvParser({ fields: fieldsRpAsSummary });


function genRowsFromRequest(data, reqId) {
  const { settlement } = data[reqId];

  const rpIdp = [];
  settlement.idpList.map((item) => {
    const request = {};
    request.rp_id = settlement.requester_node_id;
    request.request_id = settlement.request_id;
    if (settlement.closed) {
      request.status = 'Complete';
    } else {
      request.status = 'Timeout';
    }
    request.height = settlement.height;
    request.idp_id = item.idp_id;
    request.ial = item.ial;
    request.aal = item.aal;
    request.response = item.status;
    request.price = item.idp_price;
    request.full_price = item.idp_full_price;

    rpIdp.push(request);
  });

  const rpAs = [];
  settlement.asList.map((item) => {
    const request = {};
    request.rp_id = settlement.requester_node_id;
    request.request_id = settlement.request_id;
    if (settlement.closed) {
      request.status = 'Complete';
    } else {
      request.status = 'Timeout';
    }
    request.height = settlement.height;
    request.as_id = item.as_id;
    request.service_id = item.service_id;
    request.price = item.as_price;

    rpAs.push(request);
  });

  return {
    rpIdp,
    rpAs,
  };
}

function getList(allRows) {
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
  fs.writeFile(filePath, csv, (err) => {
    if (err) throw err;
  });
}

function genSummaryRpIdp(path, requests, nodeIdList, outputDirPath) {
  const summary = [];
  nodeIdList.map((id) => {
    const filter = requests.filter(item => item.idp_id === id);
    const sum = filter.reduce((prev, curr) => ({
      rpId: curr.rp_id,
      idpId: curr.idp_id,
      idpPrice: prev.idpPrice + curr.price,
    }), {
      idpPrice: 0,
    });
    summary.push(sum);
  });
  const sumCsv = rpIdpSumParser.parse(summary);
  createFile(sumCsv, path, outputDirPath);
}

function genSummaryRpAs(path, requests, checkDataList, checkRp, outputDirPath) {
  const summary = [];
  checkDataList.map((checkData) => {
    const filter = requests.filter((item) => {
      if (checkRp) {
        return checkData.rpId === item.rp_id && checkData.serviceId === item.service_id;
      }
      return checkData.asId === item.as_id && checkData.serviceId === item.service_id;
    });
    const sumRpAs = filter.reduce((prev, curr) => ({
      rpId: curr.rp_id,
      asId: curr.as_id,
      serviceId: curr.service_id,
      asPrice: prev.asPrice + curr.price,
    }), {
      asPrice: 0,
    });
    summary.push(sumRpAs);
  });
  const sumCsv = rpAsSumParser.parse(summary);
  createFile(sumCsv, path, outputDirPath);
}

function genCSV(settlementWithPrice, outputDirPath) {
  const allReqIds = Object.keys(settlementWithPrice);
  const allRows = allReqIds
    .map(reqId => genRowsFromRequest(settlementWithPrice, reqId))
    .reduce((prev, curr) => ({
      rpIdp: prev.rpIdp.concat(curr.rpIdp),
      rpAs: prev.rpAs.concat(curr.rpAs),
    }), {
      rpIdp: [],
      rpAs: [],
    });
  const list = getList(allRows);


  list.rpList.forEach((id) => {
    const rpIdp = [];
    allRows.rpIdp.forEach((row) => {
      if (id === row.rp_id) {
        rpIdp.push(row);
      }
    });
    const csv = rpIdpParser.parse(rpIdp);
    createFile(csv, `csv/rp-idp/${id}.csv`, outputDirPath);

    const idp = [];
    rpIdp.forEach((item) => {
      if (!idp.includes(item.idp_id)) {
        idp.push(item.idp_id);
      }
    });
    genSummaryRpIdp(`csv/rp-idp-summary/${id}.csv`, rpIdp, idp, outputDirPath);
  });

  list.idpList.map((id) => {
    const idpRp = [];
    allRows.rpIdp.forEach((row) => {
      if (id === row.idp_id) {
        idpRp.push(row);
      }
    });
    const csv = rpIdpParser.parse(idpRp);
    createFile(csv, `csv/idp-rp/${id}.csv`, outputDirPath);

    const rp = [];
    idpRp.forEach((item) => {
      if (!rp.includes(item.idp_id)) {
        rp.push(item.idp_id);
      }
    });
    genSummaryRpIdp(`csv/idp-rp-summary/${id}.csv`, idpRp, rp, outputDirPath);
  });

  list.rpList.map((id) => {
    const rpAs = [];
    allRows.rpAs.forEach((row) => {
      if (id === row.rp_id) {
        rpAs.push(row);
      }
    });
    const csv = rpAsParser.parse(rpAs);
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
    genSummaryRpAs(`csv/rp-as-summary/${id}.csv`, rpAs, asList, false, outputDirPath);
  });

  list.asList.map((id) => {
    const asRp = [];
    allRows.rpAs.forEach((row) => {
      if (id === row.as_id) {
        asRp.push(row);
      }
    });
    const csv = rpAsParser.parse(asRp);
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
    genSummaryRpAs(`csv/as-rp-summary/${id}.csv`, asRp, asList, true, outputDirPath);
  });
}

module.exports.genCSV = genCSV;
