const fs = require('fs-extra');
const path = require('path');
const mkpath = require('mkpath');
const moment = require('moment');


function writeNextRoundInfoJson(chainId, nextMinBlockHeight, nextBillPeriodStart, jsonFilePath) {
  const nextRound = {
    chain_id: chainId,
    min_block_height: nextMinBlockHeight,
    bill_period_start: moment(nextBillPeriodStart).format('YYYYMMDDHHmmss'),
  };

  fs.writeFileSync(jsonFilePath, JSON.stringify(nextRound, null, 2));
}

function writeNextRoundFiles(
  chainId,
  nextMinBlockHeight,
  nextBillPeriodStart,
  pendingReqsFilePath,
  nextRoundDirPath,
) {
  mkpath.sync(nextRoundDirPath);
  writeNextRoundInfoJson(chainId, nextMinBlockHeight, nextBillPeriodStart, path.join(nextRoundDirPath, 'nextRound.json'));
  fs.copyFileSync(pendingReqsFilePath, path.join(nextRoundDirPath, 'pendingRequests.json'));
}

module.exports = {
  writeNextRoundFiles,
};
