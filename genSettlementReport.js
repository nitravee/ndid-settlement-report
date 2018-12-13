const { argv } = require('yargs');
const path = require('path');
const fs = require('fs');
const mkpath = require('mkpath');
const moment = require('moment');
const { importBlockchainQueryData } = require('./src/importBlockchainQueryData');
const { importPriceListDirectories, getPriceCategories } = require('./src/importPriceList');
const { importPreviousPendingRequests } = require('./src/importPreviousPendingRequests');
const { mergePrevPendingReqsToCurrReqs } = require('./src/mergePrevPendingReqsToCurrReqs');
const { categorizeRequests } = require('./src/categorizeRequests');
const { createSummaryReport } = require('./src/createSummaryReport');
const { genCSV } = require('./src/genCSV');
const { queryNodeInfo } = require('./src/queryNodeInfo');
const { getNodeIdsFromSettlements } = require('./src/utils/requestUtil');
const { reportExecRoundDirName } = require('./src/utils/pathUtil');
const { copyReportsToWebPortalDir } = require('./src/copyReportsToWebPortalDir');
const { writeNextRoundFiles } = require('./src/writeNextRoundFiles');


const INPUT_DATETIME_FORMAT = 'YYYYMMDDHHmmss';

let chainId;
let minHeight;
let maxHeight;
let usedTokenReportDirPath = path.resolve(__dirname, './data/GetUsedTokenReport');
let requestDetailDirPath = path.resolve(__dirname, './data/RequestDetail');
let prevPendingReqsPath = path.resolve(__dirname, './data/previousPendingRequests.json');
let pricesDirPath = path.resolve(__dirname, './data/Prices');
let argvOutputDirPath = path.resolve(__dirname, './reports');
let webPortalDirPath;


const currWorkingPath = process.cwd();
if (argv.c) {
  chainId = argv.c;
}
if (argv.b) {
  minHeight = parseInt(argv.b, 10);
}
if (argv.e) {
  maxHeight = parseInt(argv.e, 10);
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
  argvOutputDirPath = path.resolve(currWorkingPath, argv.o);
}
if (argv.w) {
  webPortalDirPath = path.resolve(currWorkingPath, argv.w);
}

const webPortalSubDirs = argv['portal-sub-dir']
  ? argv['portal-sub-dir'].split('/').filter(str => str)
  : [];
const createLatestSymlink = argv['latest-symlink'];

const execDatetime = moment(process.env.EXEC_DATETIME, INPUT_DATETIME_FORMAT).toDate();

let billPeriod = null;
const billPeriodStartStr = argv['bill-period-start'];
const billPeriodEndStr = argv['bill-period-end'];
const billPeriodStart = billPeriodStartStr
  ? moment(billPeriodStartStr, INPUT_DATETIME_FORMAT).toDate()
  : null;
const billPeriodEnd = billPeriodEndStr
  ? moment(billPeriodEndStr, INPUT_DATETIME_FORMAT).toDate()
  : null;
if (
  billPeriodStart &&
  !Number.isNaN(billPeriodStart.getTime()) &&
  billPeriodEnd &&
  !Number.isNaN(billPeriodEnd.getTime())
) {
  billPeriod = {
    start: billPeriodStart,
    end: billPeriodEnd,
  };
}

const enableDebugFile = argv['debug-file'];
const nodeInfoJsonFilePath = argv['node-info-json'];

let ver = 1;
if (argv.version) {
  ver = argv.version;
}

const execRoundDirName = reportExecRoundDirName({
  billPeriodStart: billPeriod.start,
  billPeriodEnd: billPeriod.end,
  minBlockHeight: minHeight,
  maxBlockHeight: maxHeight,
  version: ver,
  execDatetime,
});
const outputDirPath = path.join(argvOutputDirPath, execRoundDirName);

const nextRoundDirPath = argv['next-round'] && path.resolve(currWorkingPath, argv['next-round']);

console.log('Started generating settlement reports.');

if (nodeInfoJsonFilePath) {
  console.log(`nodeInfo.json Path: ${nodeInfoJsonFilePath}`);
}
console.log(`GetUsedTokenReport Dir: ${usedTokenReportDirPath || 'Not specific'}`);
console.log(`RequestDetail Dir: ${requestDetailDirPath || 'Not specific'}`);
console.log(`Prices Dir: ${pricesDirPath || 'Not specific'}`);
console.log(`pendingRequests.json Path: ${prevPendingReqsPath || 'Not specific'}`);
console.log(`Output Dir: ${outputDirPath || 'Not specific'}`);
console.log(`Web Portal Dir: ${webPortalDirPath || 'Not specific'}`);
console.log(`Web Portal Sub Dirs: ${webPortalSubDirs || 'Not specific'}`);
if (webPortalDirPath) {
  console.log(`Create Latest Symlink: ${createLatestSymlink ? 'Yes' : 'No'}`);
}

console.log(`\nChain ID: ${chainId == null ? 'Not specific' : chainId}`);
console.log(`Min block height: ${minHeight == null ? 'Not specific' : minHeight}`);
console.log(`Max block height: ${maxHeight == null ? 'Not specific' : maxHeight}`);
console.log(`Bill period start: ${billPeriod && billPeriod.start ? billPeriod.start : 'Not specific'}`);
console.log(`Bill period end: ${billPeriod && billPeriod.end ? billPeriod.end : 'Not specific'}`);


const debugFileDirPath = path.resolve(outputDirPath, './debug');
if (enableDebugFile) {
  mkpath.sync(debugFileDirPath);
} else {
  mkpath.sync(outputDirPath);
}

// Generate report info file
fs.writeFile(
  path.join(outputDirPath, './info.txt'),
  `Execution datetime: ${moment(execDatetime).format('D-MMM-YYYY HH:mm:ss')} 
Min block height: ${minHeight}
Max block height: ${maxHeight}`,
  (err) => {
    if (err) {
      throw err;
    }
  },
);

importPriceListDirectories(path.join(pricesDirPath, chainId))
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

    const importedReqData = importBlockchainQueryData(
      usedTokenReportDirPath,
      requestDetailDirPath,
      minHeight,
      maxHeight,
    );
    console.log('Importing blockchain query data succeeded.');
    if (enableDebugFile) {
      fs.writeFile(path.resolve(debugFileDirPath, './queryDataJson.json'), JSON.stringify(importedReqData, null, 2), (err) => {
        if (err) {
          console.warn('Failed to write debug file: queryDataJson.json', err);
        }
      });
    }

    const reqData = mergePrevPendingReqsToCurrReqs(importedReqData, prevPendingReqs);
    Object.keys(reqData).forEach((reqId) => {
      if (reqData[reqId].detail == null) {
        delete reqData[reqId];
      }
    });

    console.log('Importing blockchain query data succeeded.');
    if (enableDebugFile) {
      fs.writeFile(path.resolve(debugFileDirPath, './mergedReqData.json'), JSON.stringify(reqData, null, 2), (err) => {
        if (err) {
          console.warn('Failed to write debug file: mergedReqData.json', err);
        }
      });
    }

    const categorizedReqs = categorizeRequests(reqData);
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

    let nodeInfo;
    if (nodeInfoJsonFilePath) {
      nodeInfo = JSON.parse(fs.readFileSync(nodeInfoJsonFilePath));
    } else {
      nodeInfo = await queryNodeInfo(getNodeIdsFromSettlements(Object
        .values(settlementWithPrice)
        .map(req => req.settlement)));
      console.log('Querying node info succeeded.');
    }
    if (enableDebugFile) {
      fs.writeFile(path.resolve(debugFileDirPath, './nodeInfo.json'), JSON.stringify(nodeInfo, null, 2), (err) => {
        if (err) {
          console.warn('Failed to write debug file: nodeInfo.json', err);
        }
      });
    }

    // Generate pending requests JSON file
    const pendingReqsJsonPath = path.join(outputDirPath, './pendingRequests.json');
    fs.writeFileSync(
      pendingReqsJsonPath,
      JSON.stringify(categorizedReqs.pendingRequests, null, 2),
      (err) => {
        if (err) {
          throw err;
        }
      },
    );
    console.log(`\npendingRequest.json created at ${outputDirPath}`);

    const outputCsvDirPath = path.join(outputDirPath, 'csv');
    await genCSV(
      settlementWithPrice,
      categorizedReqs.pendingRequests,
      nodeInfo,
      priceCategories,
      billPeriod,
      { min: minHeight, max: maxHeight },
      ver,
      outputCsvDirPath,
    );
    console.log(`\nSettlement report (.csv) files have been created at ${outputCsvDirPath}`);

    if (webPortalDirPath) {
      copyReportsToWebPortalDir(
        outputDirPath,
        webPortalDirPath,
        webPortalSubDirs,
        createLatestSymlink,
      );
      console.log('Copying report files to web portal directory succeeded');
    } else {
      console.log('Copying report files to web portal directory skipped');
    }

    if (nextRoundDirPath) {
      writeNextRoundFiles(
        chainId, maxHeight + 1,
        billPeriod.end,
        pendingReqsJsonPath,
        nextRoundDirPath,
      );
      console.log('\nWriting next-round files succeeded');
    } else {
      console.log('\nWriting next-round files skipped');
    }

    console.log('\nGenerating settlement reports succeeded.');
  });
