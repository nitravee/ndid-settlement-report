const fs = require('fs');
const glob = require('glob');
const path = require('path');

function importBlockchainQueryData(usedTokenReportDirPath, reqDetailDirPath, minBlockHeight, maxBlockHeight) {
  const tokenReport = glob.sync(path.join(usedTokenReportDirPath, '*.json'));
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

  const requestDetail = glob.sync(path.join(reqDetailDirPath, '*.json'));
  const details = [];
  requestDetail.forEach((file) => {
    details.push(JSON.parse(fs.readFileSync(file)));
  });

  const data = {};
  details
    .filter(detail => detail.timed_out || detail.closed)
    .forEach((detail) => {
      const reqInfo = {};
      reqInfo.detail = detail;

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
      reqInfo.steps = steps;

      const createReqStep = reqInfo.steps.find(step => step.method === 'CreateRequest');
      if (!createReqStep) {
        return;
      }

      if (minBlockHeight != null || maxBlockHeight != null) {
        if (minBlockHeight != null && createReqStep.height < minBlockHeight) {
          return;
        }
        if (maxBlockHeight != null && createReqStep.height > maxBlockHeight) {
          return;
        }
      }

      data[detail.request_id] = reqInfo;
    });

  return data;
}

module.exports = {
  importBlockchainQueryData,
};
