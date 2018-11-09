const fs = require('fs');
const glob = require('glob');
const path = require('path');

function importBlockchainQueryData(usedTokenReportDirPath, reqDetailDirPath, minBlockHeight, maxBlockHeight) {
  const tokenReport = glob.sync(path.join(usedTokenReportDirPath, '*.json'));
  const data = {};
  tokenReport.forEach((file) => {
    const filename = path.basename(file).split('.')[0];
    const blocks = JSON.parse(fs.readFileSync(file));
    blocks.forEach((block) => {
      if (block.hasOwnProperty('request_id')) {
        const { height, method, request_id: reqId } = block;

        if (!data[reqId]) {
          data[reqId] = {
            steps: [],
          };
        }

        data[reqId].steps.push({
          height,
          method,
          nodeId: filename,
        });
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
