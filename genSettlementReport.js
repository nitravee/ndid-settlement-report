const { argv } = require('yargs');
const path = require('path');
const fs = require('fs');
const mkpath = require('mkpath');
const moment = require('moment');
const { importBlockchainQueryData } = require('./src/importBlockchainQueryData');
const { importPriceListDirectories, getPriceCategories } = require('./src/importPriceList');
const { importPreviousPendingRequests } = require('./src/importPreviousPendingRequests');
const { categorizeRequests } = require('./src/categorizeRequests');
const { createSummaryReport } = require('./src/createSummaryReport');
const { genCSV } = require('./src/genCSV');
const { queryNodeInfo } = require('./src/queryNodeInfo');
const { getNodeIdsFromSettlements } = require('./src/utils/requestUtil');


let minHeight;
let maxHeight;
let nodeInfoDirPath = path.resolve(__dirname, './data/NodeInfo');
let usedTokenReportDirPath = path.resolve(__dirname, './data/GetUsedTokenReport');
let requestDetailDirPath = path.resolve(__dirname, './data/RequestDetail');
let prevPendingReqsPath = path.resolve(__dirname, './data/previousPendingRequests.json');
let pricesDirPath = path.resolve(__dirname, './data/Prices');
let outputPath = path.resolve(__dirname, './reports');


const currWorkingPath = process.cwd();
if (argv.b) {
  minHeight = parseInt(argv.b, 10);
}
if (argv.e) {
  maxHeight = parseInt(argv.e, 10);
}
if (argv.i) {
  nodeInfoDirPath = path.resolve(currWorkingPath, argv.i);
}
if (argv.r) {
  usedTokenReportDirPath = path.resolve(currWorkingPath, argv.r);
}
if (argv.d) {
  requestDetailDirPath = path.resolve(currWorkingPath, argv.d);
}
if (argv.v) {
  prevPendingReqsPath = path.resolve(currWorkingPath, argv.v);
}
if (argv.p) {
  pricesDirPath = path.resolve(currWorkingPath, argv.p);
}
if (argv.o) {
  outputPath = path.resolve(currWorkingPath, argv.o);
}

const enableDebugFile = argv['debug-file'];


console.log('Started generating settlement reports.');

console.log(`\nNodeInfo Dir: ${nodeInfoDirPath}`);
console.log(`GetUsedTokenReport Dir: ${usedTokenReportDirPath}`);
console.log(`RequestDetail Dir: ${requestDetailDirPath}`);
console.log(`Prices Dir: ${pricesDirPath}`);
console.log(`pendingRequests.json Path: ${prevPendingReqsPath}`);
console.log(`Output Dir: ${outputPath}`);

console.log(`\nMin block height: ${minHeight == null ? 'Not specific' : minHeight}`);
console.log(`Max block height: ${maxHeight == null ? 'Not specific' : maxHeight}`);

const debugFileDirPath = path.resolve(outputPath, './debug');
if (enableDebugFile) {
  mkpath.sync(debugFileDirPath);
} else {
  mkpath.sync(outputPath);
}

const execDatetime = moment(process.env.EXEC_DATETIME, 'YYYYMMDD_HHmmss')
  .format('D-MMM-YYYY HH:mm:ss');

// Generate report info file
fs.writeFile(
  path.join(outputPath, './info.txt'),
  `Execution datetime: ${execDatetime} 
  Min block height: ${minHeight}
  Max block height: ${maxHeight}`,
  (err) => {
    if (err) {
      throw err;
    }
  },
);

importPriceListDirectories(pricesDirPath)
  .then(async (priceList) => {
    const priceCategories = getPriceCategories(priceList);
    console.log('\nImporting price list succeeded.');
    if (enableDebugFile) {
      fs.writeFile(path.resolve(debugFileDirPath, './priceList.json'), JSON.stringify(priceList, null, 2), (err) => {
        if (err) {
          console.warn('Failed to write debug file: priceList.json', err);
        }
      });
      fs.writeFile(path.resolve(debugFileDirPath, './priceCategories.json'), JSON.stringify(priceCategories, null, 2), (err) => {
        if (err) {
          console.warn('Failed to write debug file: priceCategories.json', err);
        }
      });
    }

    const prevPendingReqs = importPreviousPendingRequests(prevPendingReqsPath);
    console.log('Importing previous pending requests succeeded.');
    if (enableDebugFile) {
      fs.writeFile(path.resolve(debugFileDirPath, './previousPendingRequests.json'), JSON.stringify(prevPendingReqs, null, 2), (err) => {
        if (err) {
          console.warn('Failed to write debug file: previousPendingRequests.json', err);
        }
      });
    }

    const reqData = importBlockchainQueryData(usedTokenReportDirPath, requestDetailDirPath, minHeight, maxHeight);
    console.log('Importing blockchain query data succeeded.');
    if (enableDebugFile) {
      fs.writeFile(path.resolve(debugFileDirPath, './queryDataJson.json'), JSON.stringify(reqData, null, 2), (err) => {
        if (err) {
          console.warn('Failed to write debug file: queryDataJson.json', err);
        }
      });
    }

    const categorizedReqs = categorizeRequests(reqData, prevPendingReqs);
    console.log('Calculating settlement succeeded.');
    if (enableDebugFile) {
      fs.writeFile(path.resolve(debugFileDirPath, './categorizedRequests.json'), JSON.stringify(categorizedReqs, null, 2), (err) => {
        if (err) {
          console.warn('Failed to write debug file: settlement.json', err);
        }
      });
    }

    const settlementWithPrice = createSummaryReport(categorizedReqs.finishedRequests, priceList);
    console.log('Calculating price for settlement succeeded.');
    if (enableDebugFile) {
      fs.writeFile(path.resolve(debugFileDirPath, './settlementWithPrice.json'), JSON.stringify(settlementWithPrice, null, 2), (err) => {
        if (err) {
          console.warn('Failed to write debug file: settlementWithPrice.json', err);
        }
      });
    }

    const nodeInfo = await queryNodeInfo(getNodeIdsFromSettlements(Object
      .values(settlementWithPrice)
      .map(req => req.settlement)));
    console.log('Querying node info succeeded.');
    if (enableDebugFile) {
      fs.writeFile(path.resolve(debugFileDirPath, './nodeInfo.json'), JSON.stringify(nodeInfo, null, 2), (err) => {
        if (err) {
          console.warn('Failed to write debug file: nodeInfo.json', err);
        }
      });
    }

    // Generate pending requests JSON file
    fs.writeFile(path.join(outputPath, './pendingRequests.json'), JSON.stringify(categorizedReqs.pendingRequests, null, 2), (err) => {
      if (err) {
        throw err;
      }
    });
    console.log(`\npendingRequest.json have been created at ${outputPath}`);

    genCSV(settlementWithPrice, categorizedReqs.pendingRequests, nodeInfo, priceCategories, outputPath);
    console.log(`\nSettlement report (.csv) files have been created at ${outputPath}/csv`);

    console.log('\nGenerating settlement reports succeeded.');
  });
