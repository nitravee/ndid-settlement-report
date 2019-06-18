const fs = require('fs-extra');
const path = require('path');
const mkpath = require('mkpath');
const moment = require('moment');


function writeRoundInfoJson(
  chainId,
  minBlockHeight,
  maxBlockHeight,
  billPeriodStart,
  billPeriodEnd,
  monthYear,
  jsonFilePath,
) {
  const nextRound = {};

  if (chainId != null) {
    nextRound.chain_id = chainId;
  }

  if (minBlockHeight != null) {
    nextRound.min_block_height = minBlockHeight;
  }

  if (maxBlockHeight != null) {
    nextRound.max_block_height = maxBlockHeight;
  }

  if (billPeriodStart != null) {
    nextRound.bill_period_start = moment(billPeriodStart).format('YYYYMMDDHHmmss');
  }

  if (billPeriodEnd != null) {
    nextRound.bill_period_end = moment(billPeriodEnd).format('YYYYMMDDHHmmss');
  }

  if (monthYear != null) {
    nextRound.month = `${monthYear.month}-${monthYear.year}`;
  }

  fs.writeFileSync(jsonFilePath, JSON.stringify(nextRound, null, 2));
}

function writeRoundFiles(
  chainId,
  minBlockHeight,
  maxBlockHeight,
  billPeriodStart,
  billPeriodEnd,
  monthYear,
  srcPendingReqsFilePath,
  roundDirPath,
  options = {},
) {
  const {
    outputRoundInfoJsonFileName = 'nextRound.json',
    outputPendingRequestsFileName = 'pendingRequests.json',
  } = options;

  mkpath.sync(roundDirPath);
  writeRoundInfoJson(
    chainId,
    minBlockHeight,
    maxBlockHeight,
    billPeriodStart,
    billPeriodEnd,
    monthYear,
    path.join(roundDirPath, outputRoundInfoJsonFileName),
  );
  if (fs.existsSync(srcPendingReqsFilePath) && fs.lstatSync(srcPendingReqsFilePath).isFile()) {
    fs.copyFileSync(srcPendingReqsFilePath, path.join(roundDirPath, outputPendingRequestsFileName));
  }
}

module.exports = {
  writeRoundFiles,
};
