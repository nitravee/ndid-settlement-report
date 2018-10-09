const chai = require('chai');
const path = require('path');

const { expect } = chai;
const { importBlockchainQueryData } = require('../importBlockchainQueryData.js');

const _ = require('lodash');
const fs = require('fs');

// Start test cases for Example Behaviors
function itAlwaysTrue() {
  const data = fs.readFileSync('expected.json');
  const output = JSON.parse(data);
  const usedTokenReportDirPath = path.resolve(__dirname, '../test-data/GetUsedTokenReport');
  const reqDetailDirPath = path.resolve(__dirname, '../test-data/RequestDetail');
  expect(_.isEqual(importBlockchainQueryData(usedTokenReportDirPath, reqDetailDirPath, 0, 3000), output))
    .to.be.true;
}

function itShouldBeEmpty() {
  const usedTokenReportDirPath = path.resolve(__dirname, '../test-data/GetUsedTokenReport');
  const reqDetailDirPath = path.resolve(__dirname, '../test-data/RequestDetail');
  expect(_.isEqual(importBlockchainQueryData(usedTokenReportDirPath, reqDetailDirPath, 10000, 15000), {}))
    .to.be.true;
}

// Start Example Behaviors
function exampleBehaviors() {
  it('should be true', itAlwaysTrue);
  it('should be empty', itShouldBeEmpty);
}

// Start Describe
describe('Example', exampleBehaviors);

