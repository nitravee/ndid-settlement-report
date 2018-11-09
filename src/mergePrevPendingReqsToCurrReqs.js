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

  return mergedReqs;
}

module.exports = { mergePrevPendingReqsToCurrReqs };
