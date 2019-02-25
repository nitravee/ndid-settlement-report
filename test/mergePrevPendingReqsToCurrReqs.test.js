const chai = require('chai');
const { mergePrevPendingReqsToCurrReqs } = require('../src/mergePrevPendingReqsToCurrReqs');

const { expect } = chai;

const dummyReq1Id = 'dummy-req-1';
const dummyReq1 = {
  detail: {
    request_id: dummyReq1Id,
    'dummy-detail-key-1': 'dummy-detail-value-1',
    'dummy-detail-key-2': 'dummy-detail-value-2',
    'dummy-detail-key-3': 'dummy-detail-value-3',
  },
  steps: [
    {
      'dummy-step-1-key-1': 'dummy-step-1-value-1',
      'dummy-step-1-key-2': 'dummy-step-1-value-2',
      'dummy-step-1-key-3': 'dummy-step-1-value-3',
    },
    {
      'dummy-step-2-key-1': 'dummy-step-2-value-1',
      'dummy-step-2-key-2': 'dummy-step-2-value-2',
      'dummy-step-2-key-3': 'dummy-step-2-value-3',
    },
  ],
  settlement: {
    'dummy-settlement-key-1': 'dummy-settlement-value-1',
    'dummy-settlement-key-2': 'dummy-settlement-value-2',
    'dummy-settlement-key-3': 'dummy-settlement-value-3',
  },
};

const dummyReq1Prev = {
  detail: {
    request_id: dummyReq1Id,
    'dummy-detail-key-1': 'dummy-detail-value-1-prev',
    'dummy-detail-key-2': 'dummy-detail-value-2-prev',
    'dummy-detail-key-3': 'dummy-detail-value-3-prev',
  },
  steps: [
    {
      'dummy-step-1-key-1': 'dummy-step-1-value-1-prev',
      'dummy-step-1-key-2': 'dummy-step-1-value-2-prev',
      'dummy-step-1-key-3': 'dummy-step-1-value-3-prev',
    },
    {
      'dummy-step-2-key-1': 'dummy-step-2-value-1-prev',
      'dummy-step-2-key-2': 'dummy-step-2-value-2-prev',
      'dummy-step-2-key-3': 'dummy-step-2-value-3-prev',
    },
  ],
  settlement: {
    'dummy-settlement-key-1': 'dummy-settlement-value-1-prev',
    'dummy-settlement-key-2': 'dummy-settlement-value-2-prev',
    'dummy-settlement-key-3': 'dummy-settlement-value-3-prev',
  },
};

const dummyReq1MergeOverlap = {
  detail: {
    request_id: dummyReq1Id,
    'dummy-detail-key-1': 'dummy-detail-value-1',
    'dummy-detail-key-2': 'dummy-detail-value-2',
    'dummy-detail-key-3': 'dummy-detail-value-3',
  },
  steps: [
    {
      'dummy-step-1-key-1': 'dummy-step-1-value-1-prev',
      'dummy-step-1-key-2': 'dummy-step-1-value-2-prev',
      'dummy-step-1-key-3': 'dummy-step-1-value-3-prev',
    },
    {
      'dummy-step-2-key-1': 'dummy-step-2-value-1-prev',
      'dummy-step-2-key-2': 'dummy-step-2-value-2-prev',
      'dummy-step-2-key-3': 'dummy-step-2-value-3-prev',
    },
    {
      'dummy-step-1-key-1': 'dummy-step-1-value-1',
      'dummy-step-1-key-2': 'dummy-step-1-value-2',
      'dummy-step-1-key-3': 'dummy-step-1-value-3',
    },
    {
      'dummy-step-2-key-1': 'dummy-step-2-value-1',
      'dummy-step-2-key-2': 'dummy-step-2-value-2',
      'dummy-step-2-key-3': 'dummy-step-2-value-3',
    },
  ],
  settlement: {
    'dummy-settlement-key-1': 'dummy-settlement-value-1',
    'dummy-settlement-key-2': 'dummy-settlement-value-2',
    'dummy-settlement-key-3': 'dummy-settlement-value-3',
  },
};

function mergePrevPendingReqsToCurrReqsBehaviors() {
  it('should return empty object', () => {
    expect(mergePrevPendingReqsToCurrReqs({}, {})).to.be.deep.equal({});
  });

  it('should merge nothing from empty previous pending collection', () => {    
    const currPending = {
      [dummyReq1Id]: dummyReq1,
    };

    expect(mergePrevPendingReqsToCurrReqs(currPending, {}))
      .to.be.deep.equal(currPending);
  });

  it('should merge a non-overlap request from previous pending collection', () => {
    const prevPending = {
      [dummyReq1Id]: dummyReq1Prev,
    };

    expect(mergePrevPendingReqsToCurrReqs({}, prevPending))
      .to.be.deep.equal(prevPending);
  });

  it('should merge an overlap request from previous pending collection', () => {
    const currPending = {
      [dummyReq1Id]: dummyReq1,
    };
    const prevPending = {
      [dummyReq1Id]: dummyReq1Prev,
    };
    const mergedPending = {
      [dummyReq1Id]: dummyReq1MergeOverlap,
    };

    expect(mergePrevPendingReqsToCurrReqs(currPending, prevPending))
      .to.be.deep.equal(mergedPending);
  });
}

// Start Describe
describe('mergePrevPendingReqsToCurrReqs', mergePrevPendingReqsToCurrReqsBehaviors);
