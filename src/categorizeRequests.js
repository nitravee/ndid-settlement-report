const _ = require('lodash');
const { checkIfRequestHasCloseStep, checkIfRequestHasTimeOutStep } = require('./utils/requestUtil');

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
  const requestDetail = Object.assign({}, reqDetail);
  if (requestDetail.data_request_list == null) {
    requestDetail.data_request_list = [];
  }
  if (requestDetail.response_list == null) {
    requestDetail.response_list = [];
  }

  let status;
  if (requestDetail.response_list.length === 0) {
    status = 'Pending';
  }
  // Check response's status
  const responseCount = requestDetail.response_list.reduce(
    (count, response) => {
      const newCount = Object.assign({}, count);
      if (response.status === 'accept') {
        newCount.accept = count.accept + 1;
      } else if (response.status === 'reject') {
        newCount.reject = count.reject + 1;
      }
      return newCount;
    },
    {
      accept: 0,
      reject: 0,
    },
  );
  if (responseCount.accept > 0 && responseCount.reject === 0) {
    status = 'Confirmed';
  } else if (responseCount.accept === 0 && responseCount.reject > 0) {
    status = 'Rejected';
  } else if (responseCount.accept > 0 && responseCount.reject > 0) {
    status = 'Complicated';
  }

  const serviceList = requestDetail.data_request_list.map((service) => {
    const signedAnswerCount =
      service.answered_as_id_list != null
        ? service.answered_as_id_list.length
        : 0;
    const receivedDataCount =
      service.received_data_from_list != null
        ? service.received_data_from_list.length
        : 0;
    return {
      service_id: service.service_id,
      min_as: service.min_as,
      signed_data_count: signedAnswerCount,
      received_data_count: receivedDataCount,
    };
  });

  if (requestDetail.data_request_list.length === 0) {
    // No data request
    if (requestDetail.response_list.length === requestDetail.min_idp) {
      if (
        responseCount.reject === 0
        && (responseCount.accept > 0
            || (responseCount.accept === 0
                && requestDetail.purpose === 'AddAccessor'))
      ) {
        status = 'Completed';
      }
    }
  } else if (requestDetail.data_request_list.length > 0) {
    const asSignedAnswerCount = serviceList.reduce(
      (total, service) => ({
        count: total.count + service.min_as,
        signedAnswerCount: total.signedAnswerCount + service.signed_data_count,
        receivedDataCount:
          total.receivedDataCount + service.received_data_count,
      }),
      {
        count: 0,
        signedAnswerCount: 0,
        receivedDataCount: 0,
      },
    );

    if (
      asSignedAnswerCount.count === asSignedAnswerCount.signedAnswerCount &&
      asSignedAnswerCount.signedAnswerCount ===
        asSignedAnswerCount.receivedDataCount
    ) {
      status = 'Completed';
    }
  }

  return status;
}

function categorizeRequests(currReqs) {
  let settlement = {};
  let requester_node_id = 0;
  const finishedRequests = {};
  const pendingRequests = {};
  const currReqIds = Object.keys(currReqs);


  currReqIds.forEach((reqId) => {
    const req = currReqs[reqId];
    const { steps, detail } = req;
    const { request_id, min_aal, min_ial } = detail;

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
                min_ial,
                min_aal,
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
      idp_id: nodeId, status: 'Not Answer', min_ial: detail.min_ial, min_aal: detail.min_aal, idp_fee_ratio: 0,
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

    const isClosed = checkIfRequestHasCloseStep(req);
    const isTimedOut = checkIfRequestHasTimeOutStep(req);
    settlement = {
      request_id,
      requester_node_id,
      height,
      idpList,
      asList,
      mode: detail.mode,
      closed: isClosed,
      timed_out: isTimedOut,
      status: getSettlementReqStatus(detail),
    };

    if (!isClosed && !isTimedOut) {
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
