const fs = require('fs');
const glob = require('glob');
const path = require('path');

function importBlockchainQueryData(usedTokenReportDirPath, reqDetailDirPath) {
  const tokenReport = glob.sync(path.join(usedTokenReportDirPath, '*.json'));
  const data = {};
  tokenReport.forEach((file) => {
    const filename = path.basename(file).split('.')[0];
    const blocks = JSON.parse(fs.readFileSync(file));
    blocks.forEach((block) => {
      if (block.hasOwnProperty('request_id')) {
        const { height, method, request_id: reqId, as_id: asId, service_id: serviceId } = block;

        if (!data[reqId]) {
          data[reqId] = {
            steps: [],
          };
        }

        const step = {
          height,
          method,
          nodeId: filename,
        };

        if (asId) {
          step.asId = asId;
        }
        if (serviceId) {
          step.serviceId = serviceId;
        }

        data[reqId].steps.push(step);
      }
    });
  });

  const requestDetail = glob.sync(path.join(reqDetailDirPath, '*.json'));
  const details = [];
  requestDetail.forEach((file) => {
    details.push(JSON.parse(fs.readFileSync(file)));
  });

  details
    .forEach((detail) => {
      const reqInfo = data[detail.request_id] || {};
      reqInfo.detail = detail;

      data[detail.request_id] = reqInfo;
    });

  return data;
}

module.exports = {
  importBlockchainQueryData,
};
