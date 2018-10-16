const chai = require('chai');
const path = require('path');
const _ = require('lodash');
const { importPriceList, importPriceListDirectories } = require('../src/importPriceList');
const expectedPriceList = require('../test-data/expectedPriceList');

const { expect } = chai;


function importPriceListBehaviors() {
  it('should be true', async () => {
    const idpCsvPath0 = path.resolve(__dirname, '../test-data/Prices/0/idp_price.csv');
    const asCsvPath0 = path.resolve(__dirname, '../test-data/Prices/0/as_price.csv');
    const mappingPath0 = path.resolve(__dirname, '../test-data/Prices/0/orgToNodeIdMapping.json');

    const idpCsvPath5000 = path.resolve(__dirname, '../test-data/Prices/5000/idp_price.csv');
    const asCsvPath5000 = path.resolve(__dirname, '../test-data/Prices/5000/as_price.csv');
    const mappingPath5000 = path.resolve(__dirname, '../test-data/Prices/5000/orgToNodeIdMapping.json');

    const result1 = await importPriceList(0, 4999, idpCsvPath0, asCsvPath0, mappingPath0);
    const result2 = await importPriceList(5000, undefined, idpCsvPath5000, asCsvPath5000, mappingPath5000);
    const result = [result1, result2];

    expect(_.isEqual(result, expectedPriceList)).to.be.true;
  });
}

function importPriceListDirectoriesBehaviors() {
  it('should be true', async () => {
    const rootDirPath = path.resolve(__dirname, '../test-data/Prices');
    const result = await importPriceListDirectories(rootDirPath);

    expect(_.isEqual(result, expectedPriceList)).to.be.true;
  });
}

// Start Describe
describe('importPriceList', importPriceListBehaviors);
describe('importPriceListDirectories', importPriceListDirectoriesBehaviors);
