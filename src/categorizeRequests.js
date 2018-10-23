const _ = require('lodash');

// const checkConditionDetail = {
//   statusAcceptGreaterThanOrEqualMinIdp: (responseList, minIdp) => {
//     let count = 0;
//     responseList.forEach((data) => {
//       if (data.status === 'accept') count++;
//     });
//     return count >= minIdp;
//   },
//   statusRejectGreaterThanMinOne: (responseList) => {
//     let count = 0;
//     responseList.forEach((data) => {
//       if (data.status === 'reject') count++;
//     });
//     return count > 1;
//   },
//   receivedDataGreaterThanOrEqualMinAs: (dataRequestList) => {
//     const check = [];
//     dataRequestList.forEach((data, index) => {
//       check[index] = data.received_data_from_list.length >= data.min_as;
//     });
//     return check.every(booleanInCheck => booleanInCheck);
//   },
//   receivedIsEmptyArray: (dataRequestList) => {
//     const check = [];
//     dataRequestList.forEach((data, index) => {
//       check[index] = data.received_data_from_list.length === 0;
//     });
//     return check.every(booleanInCheck => booleanInCheck);
//   },
//   answeredIsEmptyArray: (dataRequestList) => {
//     const check = [];
//     dataRequestList.forEach((data, index) => {
//       check[index] = data.answered_as_id_list.length === 0;
//     });
//     return check.every(booleanInCheck => booleanInCheck);
//   },
//   fieldValidFalseGreaterThanOneField: (responseList) => {
//     let count = 0;
//     responseList.forEach((data) => {
//       for (let rootName in data) {
//           if (rootName.includes('valid_')) {
//             if (!data[rootName]) count++; 
//           }
//       }
//     });
//     return count > 1;
//   },
//   responseListIsEmptyArray: (responseList) => responseList === null,
//   noItemInAnswerAndReceived: (dataRequestList) => {
//     let check = false;
//     dataRequestList.as_id_list.forEach((data) => {
//       if (!dataRequestList.received_data_from_list.includes(data) && !dataRequestList.answered_as_id_list.includes(data)) check = true;
//     });
//     return check;
//   },
//   haveItemInAnswerButNoHaveInReceived: (dataRequestList) => {
//     let check = false;
//     dataRequestList.answered_as_id_list.forEach((data) => {
//       if (!dataRequestList.received_data_from_list.includes(data)) check = true;
//     });
//     return check;
//   },
// };

function getSettlementReqStatus(reqDetail) {
  // TODO: Revise req status

  if (reqDetail.timed_out) {
    return 'Timeout';
  }

  if (!reqDetail.timed_out && !reqDetail.closed) {
    return 'Pending';
  }

  const haveUnsuccessfulDataReq = reqDetail.data_request_list && reqDetail
    .data_request_list
    .find(dataReqInfo =>
      dataReqInfo.received_data_from_list.length < dataReqInfo.min_as) !== undefined;

  if (haveUnsuccessfulDataReq) {
    return 'Close';
  }

  const validIdpResponseList = reqDetail.response_list ? reqDetail
    .response_list
    .filter(idpResp => idpResp.valid_proof !== false
      && idpResp.valid_signature !== false
      && idpResp.valid_ial !== false) : [];

  return validIdpResponseList.length >= reqDetail.min_idp ? 'Complete' : 'Close';
}

function categorizeRequests(currReqs, prevPendingReqs = {}) {
  let settlement = {};
  let requester_node_id = 0;
  const finishedRequests = {};
  const pendingRequests = {};
  const currReqIds = Object.keys(currReqs);

  // Forward prev pending requests which still be pending in the block height range
  Object
    .keys(prevPendingReqs)
    .filter(reqId => !currReqIds.includes(reqId))
    .forEach((reqId) => {
      pendingRequests[reqId] = prevPendingReqs[reqId];
    });

  // Merge prev pending requests into the current block height range's one if possible
  Object
    .keys(prevPendingReqs)
    .filter(reqId => currReqIds.includes(reqId))
    .forEach((reqId) => {
      const prevPendReq = prevPendingReqs[reqId];
      const currReq = currReqs[reqId];
      currReq.steps = [
        ...prevPendReq.steps,
        ...currReq.steps,
      ];
    });

  currReqIds.forEach((reqId) => {
    const { steps, detail } = currReqs[reqId];
    const { request_id } = detail;

    const idpList = [];
    const asList = [];
    let height;
    steps.forEach((dataInSteps) => {
      if (dataInSteps.method === 'CreateRequest') {
        height = dataInSteps.height;
        requester_node_id = dataInSteps.nodeId;
      } else if (dataInSteps.method === 'CreateIdpResponse') {
        const idp_fee_ratio = 1;
        if (detail.response_list !== null) {
          detail.response_list.forEach((dataInResponse) => {
            if (dataInResponse.idp_id === dataInSteps.nodeId) {
              const {
                status,
                ial,
                aal,
                idp_id,
                valid_signature,
                valid_ial,
              } = dataInResponse;
              idpList.push({
                idp_id,
                status,
                ial,
                aal,
                valid_signature,
                valid_ial,
                idp_fee_ratio,
              });
            }
          });
        }
      }
    });

    // Request to an IdP but there is no CreateIdpReponse according to it
    const notAnswerIdpNodeIds = detail.idp_id_list
      .filter(nodeId =>
        !idpList.map(idpSettlementInfo => idpSettlementInfo.idp_id).includes(nodeId));
    idpList.push(...notAnswerIdpNodeIds.map(nodeId => ({
      idp_id: nodeId, status: 'Not Answer', ial: detail.min_ial, aal: detail.min_aal, idp_fee_ratio: 0,
    })));

    asList.push(...detail.data_request_list
      .map(dataReq => dataReq.as_id_list.map((asId) => {
        const dataAnswered = dataReq.answered_as_id_list.includes(asId);
        return {
          as_id: asId,
          service_id: dataReq.service_id,
          data_answered: dataAnswered,
          data_received: dataReq.received_data_from_list.includes(asId),
          as_fee_ratio: dataAnswered ? 1.0 : 0.0,
        };
      }))
      .reduce((prev, curr) => prev.concat(curr), []));

    settlement = {
      request_id,
      requester_node_id,
      height,
      idpList,
      asList,
      mode: detail.mode,
      closed: detail.closed,
      timedOut: detail.timed_out,
      status: getSettlementReqStatus(detail),
    };

    if (settlement.status === 'Pending') {
      pendingRequests[reqId] = { ...currReqs[reqId], settlement };
    } else {
      finishedRequests[reqId] = { ...currReqs[reqId], settlement };
    }
  });

  return {
    finishedRequests,
    pendingRequests,
  };
}

module.exports = { categorizeRequests };
