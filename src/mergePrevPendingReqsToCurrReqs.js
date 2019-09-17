const _ = require('lodash');

function reconcileRequestDetail(reqDetail, steps) {
  if (!reqDetail || !steps) {
    return null;
  }

  const { response_list, data_request_list } = reqDetail;
  const reconciledReqDetail = _.cloneDeep(reqDetail);

  reconciledReqDetail.timed_out = steps.find(s => s.method === 'TimeOutRequest') != null;
  reconciledReqDetail.closed = steps.find(s => s.method === 'CloseRequest') != null;

  // response_list
  if (response_list) {
    const allRespondedIdPIdsInSteps = steps
      .filter(s => s.method === 'CreateIdpResponse')
      .map(s => s.nodeId);
    reconciledReqDetail.response_list = response_list
      .filter(respItem => allRespondedIdPIdsInSteps.includes(respItem.idp_id));
  }

  // data_request_list
  const reconciledDataReqList = [];
  for (const dataReqEntry of data_request_list) {
    const reconciledEntry = _.cloneDeep(dataReqEntry);
    reconciledEntry.answered_as_id_list = steps
      .filter(s =>
        s.method === 'SignData'
        && s.serviceId === dataReqEntry.service_id
        && dataReqEntry.as_id_list.includes(s.nodeId))
      .map(s => s.nodeId);
    reconciledEntry.received_data_from_list = steps
      .filter(s =>
        s.method === 'SetDataReceived'
        && s.serviceId === dataReqEntry.service_id
        && dataReqEntry.as_id_list.includes(s.as_id))
      .map(s => s.as_id);
    reconciledDataReqList.push(reconciledEntry);
  }

  return reconciledReqDetail;
}

function mergePrevPendingReqsToCurrReqs(currReqs, prevPendingReqs) {
  const mergedReqs = Object.assign({}, currReqs);

  Object.keys(prevPendingReqs).forEach((pendingReqId) => {
    const pendingReq = prevPendingReqs[pendingReqId];
    const { detail: pendingReqDetail, steps: pendingReqSteps } = pendingReq;

    const req = mergedReqs[pendingReqId];
    if (!req) {
      mergedReqs[pendingReqDetail.request_id] = pendingReq;
      return;
    }

    if (!req.detail) {
      req.detail = pendingReqDetail;
    }

    req.steps = [
      ...pendingReqSteps,
      ...req.steps,
    ];
  });

  Object.keys(mergedReqs).forEach((reqId) => {
    const req = mergedReqs[reqId];
    req.detail = reconcileRequestDetail(req.detail, req.steps);
  });

  return mergedReqs;
}

module.exports = { mergePrevPendingReqsToCurrReqs };
