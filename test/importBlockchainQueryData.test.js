const chai = require('chai');

const { expect } = chai;
const { importBlockchainQueryData } = require('../importBlockchainQueryData.js');

const _ = require('lodash');
const fs = require('fs');

// Start test cases for Example Behaviors
function itAlwaysTrue() {
  const data = fs.readFileSync('expected.json');
  const output = JSON.parse(data);
  expect(_.isEqual(importBlockchainQueryData(), output)).to.be.true;
}

// Start Example Behaviors
function exampleBehaviors() {
  it('should be true', itAlwaysTrue);
}

// Start Describe
describe('Example', exampleBehaviors);

