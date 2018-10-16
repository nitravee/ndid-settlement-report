const { argv } = require('yargs');
const path = require('path');
const { importBlockchainQueryData } = require('./src/importBlockchainQueryData');
const { importPriceListDirectories } = require('./src/importPriceList');
const { categorizedRequests } = require('./src/categorizedRequests');
const { createSummaryReport } = require('./src/createSummaryReport');
const { genCSV } = require('./src/genCSV');

let minHeight;
let maxHeight;
let usedTokenReportDirPath = path.resolve(__dirname, './data/GetUsedTokenReport');
let requestDetailDirPath = path.resolve(__dirname, './data/RequestDetail');
let pricesDirPath = path.resolve(__dirname, './data/Prices');
let outputPath = path.resolve(__dirname, './reports');

const currWorkingPath = process.cwd();
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
if (argv.p) {
  pricesDirPath = path.resolve(currWorkingPath, argv.p);
}
if (argv.o) {
  outputPath = path.resolve(currWorkingPath, argv.o);
}

console.log('Started generating settlement reports.');

console.log(`\nGetUsedTokenReport Dir: ${usedTokenReportDirPath}`);
console.log(`RequestDetail Dir: ${requestDetailDirPath}`);
console.log(`Prices Dir: ${pricesDirPath}`);
console.log(`Output Dir: ${outputPath}`);

console.log(`\nMin block height: ${minHeight == null ? 'Not specific' : minHeight}`);
console.log(`Max block height: ${maxHeight == null ? 'Not specific' : maxHeight}`);

importPriceListDirectories(pricesDirPath)
  .then((priceList) => {
    console.log('\nImporting price list succeeded.');

    const reqData = importBlockchainQueryData(usedTokenReportDirPath, requestDetailDirPath, minHeight, maxHeight);
    console.log('Importing blockchain query data succeeded.');

    const settlement = categorizedRequests(reqData);
    console.log('Calculating settlement succeeded.');

    const settlementWithPrice = createSummaryReport(settlement, priceList);
    console.log('Calculating price for settlement succeeded.');

    genCSV(settlementWithPrice, outputPath);
    console.log(`\nSettlement report (.csv) files have been created at ${outputPath}`);

    console.log('\nGenerating settlement reports succeeded.');
  });
