const fs = require('fs');
const glob = require('glob');
const path = require('path');

function importBlockchainQueryData() {
  const tokenReport = glob.sync('test-data/GetUsedTokenReport/*.json');
  const requests = [];
  tokenReport.forEach((file) => {
    const filename = path.basename(file).split('.')[0];
    const data = JSON.parse(fs.readFileSync(file));
    data.forEach((request) => {
      if (request.hasOwnProperty('request_id')) {
        request.nodeId = filename;
        requests.push(request);
      }
    });
  });

  const requestDetail = glob.sync('test-data/RequestDetail/*.json');
  const details = [];
  requestDetail.forEach((file) => {
    details.push(JSON.parse(fs.readFileSync(file)));
  });

  const data = {};
  details.forEach((detail) => {
    data[detail.request_id] = {};
    data[detail.request_id].detail = detail;
    const steps = [];
    requests.forEach((request) => {
      const step = {};
      if (request.request_id === detail.request_id) {
        step.height = request.height;
        step.method = request.method;
        step.nodeId = request.nodeId;
        steps.push(step);
      }
    });
    data[detail.request_id].steps = steps;
  });

  return data;
}

module.exports = {
  importBlockchainQueryData,
};
