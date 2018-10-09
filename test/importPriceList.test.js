const chai = require('chai');
const path = require('path');
const _ = require('lodash');
const { importPriceList, importPriceListDirectories } = require('../importPriceList');
const expectedPriceList = require('../expectedPriceList');

const { expect } = chai;


function importPriceListBehaviors() {
  it('should be true', async () => {
    const idpCsvPath = path.resolve(__dirname, '../test-data/Prices/0_4999/idp_price.csv');
    const asCsvPath = path.resolve(__dirname, '../test-data/Prices/0_4999/as_price.csv');
    const mappingPath = path.resolve(__dirname, '../test-data/Prices/0_4999/orgToNodeIdMapping.json');

    const result1 = await importPriceList(0, 4999, idpCsvPath, asCsvPath, mappingPath);
    const result2 = await importPriceList(5000, 9999, idpCsvPath, asCsvPath, mappingPath);
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
