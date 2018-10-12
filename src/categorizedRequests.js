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

function categorizedRequests(objData) {
  let settlement = {};
  let requester_node_id = 0;
  for (let rootName in objData) {
    const idpList = [];
    const asList = [];
    const { request_id, timed_out, closed, response_list, min_idp, data_request_list } = objData[rootName].detail;
    const { steps, detail } = objData[rootName];
    const idp_id = 0;
    let as_id = 0;
    steps.forEach(dataInSteps => {
      if (dataInSteps.method === 'CreateRequest') {
        height = dataInSteps.height;
        requester_node_id = dataInSteps.nodeId;
      } else if (dataInSteps.method === 'CreateIdpResponse') {
            const idp_fee_ratio = 1;
            if (detail.response_list !== null) {
                detail.response_list.forEach((dataInResponse) => {
                    if (dataInResponse.idp_id === dataInSteps.nodeId) {
                        const { status, ial, aal, idp_id } = dataInResponse;
                        idpList.push({ idp_id, status, ial, aal, idp_fee_ratio });
                    }
                });
            }
            // else {
            //     idpList.push({ idp_id, status: 'Not Answer', ial: detail.min_ial, aal: detail.min_aal, idp_fee_ratio });
            // }
      } 
    //   else if (dataInSteps.method === 'SignData') {
    //         let as_price = 1;
    //         let service_id = '';
    //         as_id = dataInSteps.nodeId;
    //         if (detail.data_request_list !== null) {
    //             detail.data_request_list.forEach((data) => {
    //                 if (data.as_id_list.includes(dataInSteps.nodeId)) {
    //                     service_id = data.service_id;
    //                     if (data.answered_as_id_list.length !== 0) {
    //                         if (!data.answered_as_id_list.includes(dataInSteps.nodeId) && !data.received_data_from_list.includes(dataInSteps.nodeId) && detail.closed) as_price = 0; // เคสที่asไม่ได้เงิน
    //                     }
    //                 }
    //             });
    //         if (as_price > 0) asList.push({ as_id, service_id });
    //         }
    //   } 
      // else if (dataInSteps.method === 'TimeOutRequest') {
      //       const newSteps = steps.filter(data => data.method === 'CreateIdpResponse');
      //       if (detail.idp_id_list.length > newSteps.length) {
      //           if (newSteps.length >= 1) {
      //               detail.idp_id_list.forEach((data) => {
      //                   newSteps.forEach((dataInNewSteps) => {
      //                       if (dataInNewSteps.nodeId !== data) idpList.push({ idp_id: data, status: 'Not Answer', ial: detail.min_ial, aal: detail.min_aal, idp_fee_ratio: 0.5 });
      //                   });
      //               });
      //           } else { 
      //               idpList.push({ idp_id: detail.idp_id_list[0], status: 'Not Answer', ial: detail.min_ial, aal: detail.min_aal, idp_fee_ratio: 0.5 });
      //           }
      //       }
      // }
    });

    // Request to an IdP but there is no CreateIdpReponse according to it
    const notAnswerIdpNodeIds = detail.idp_id_list.filter(nodeId => !idpList.map(idpSettlementInfo => idpSettlementInfo.idp_id).includes(nodeId));
    idpList.push(...notAnswerIdpNodeIds.map(nodeId => ({ idp_id: nodeId, status: 'Not Answer', ial: detail.min_ial, aal: detail.min_aal, idp_fee_ratio: 0 })));

    asList.push(...detail.data_request_list
      .filter(dataReq => dataReq.answered_as_id_list.length > 0)
      .map(dataReq => dataReq.answered_as_id_list.map(asId => ({ 
        as_id: asId,
        service_id: dataReq.service_id,
      })))
      .reduce((prev, curr) => prev.concat(curr), []));

    settlement = { request_id, requester_node_id, height, idpList, asList, closed };
    objData[rootName] = { ...objData[rootName], settlement };
  }
  return objData;
}

module.exports.categorizedRequests = categorizedRequests;
