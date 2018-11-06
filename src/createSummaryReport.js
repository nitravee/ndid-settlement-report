
const _ = require('lodash');

// const dataTest = {
//     "1de6e10b2933948cdca039081f5eacd02683e74b51db62e55da60d61dca558ba": {
//       "detail": {
//         "request_timeout": 60,
//         "requester_node_id": "ncb_rp_1",
//         "response_list": [
//           {
//             "status": "accept",
//             "ial": 2.3,
//             "private_proof_hash": "",
//             "aal": 2.2,
//             "identity_proof": "",
//             "valid_proof": null,
//             "idp_id": "mock_idp_2",
//             "valid_signature": null,
//             "signature": "this is signature",
//             "valid_ial": null
//           },
//           {
//             "status": "accept",
//             "ial": 2.3,
//             "private_proof_hash": "",
//             "aal": 2.2,
//             "identity_proof": "",
//             "valid_proof": null,
//             "idp_id": "mock_idp_1",
//             "valid_signature": null,
//             "signature": "this is signature",
//             "valid_ial": null
//           }
//         ],
//         "min_idp": 2,
//         "timed_out": false,
//         "min_aal": 2.2,
//         "data_request_list": [
//           {
//             "as_id_list": [
//               "ncb_as_2"
//             ],
//             "answered_as_id_list": [
//               "ncb_as_2"
//             ],
//             "request_params_hash": "XZVncUNW3Tmep5UiPuneZPQ2FTanWPB3E3Mgqy6/sFg=",
//             "received_data_from_list": [
//               "ncb_as_2"
//             ],
//             "service_id": "002.credit_info_001",
//             "min_as": 1
//           }
//         ],
//         "special": false,
//         "closed": true,
//         "request_id": "1de6e10b2933948cdca039081f5eacd02683e74b51db62e55da60d61dca558ba",
//         "min_ial": 2.3,
//         "request_message_hash": "nd//Vrgrr9UYKz/Tj3CQu56TQTmdGX7m2B3GlKomRzw=",
//         "mode": 1
//       },
//       "steps": [
//         {
//           "height": 5748,
//           "method": "CreateIdpResponse",
//           "nodeId": "mock_idp_1"
//         },
//         {
//           "height": 5747,
//           "method": "CreateIdpResponse",
//           "nodeId": "mock_idp_2"
//         },
//         {
//           "height": 5750,
//           "method": "SignData",
//           "nodeId": "ncb_as_2"
//         },
//         {
//           "height": 5745,
//           "method": "CreateRequest",
//           "nodeId": "ncb_rp_1"
//         },
//         {
//           "height": 5752,
//           "method": "SetDataReceived",
//           "nodeId": "ncb_rp_1"
//         },
//         {
//           "height": 5754,
//           "method": "CloseRequest",
//           "nodeId": "ncb_rp_1"
//         }
//       ],
//       "settlement":
//         {
//           "request_id": "1de6e10b2933948cdca039081f5eacd02683e74b51db62e55da60d61dca558ba",
//           "requester_node_id": "ncb_rp_1",
//           "height": 5748,
//           "idpList": [
//             {
//               "idp_id": "mock_idp_1",
//               "status": "accept",
//               "ial": 2.3,
//               "aal": 2.2,
//               "idp_fee_ratio": 1
//             },
//             {
//               "idp_id": "mock_idp_2",
//               "status": "accept",
//               "ial": 2.3,
//               "aal": 2.2,
//               "idp_fee_ratio": 0.5
//             }
//           ],
//           "asList": [
//             {
//               "as_id": "ncb_as_2",
//               "service_id": "002.credit_info_001",
//               "as_fee" : 50
//             }
//           ],
//           "closed": true
//         }
//     },
//     "1de0e10b2933948cdca039081f5eacd02683e74b51db62e55da60d61dca558ba": {
//       "detail": {
//         "request_timeout": 60,
//         "requester_node_id": "ncb_rp_1",
//         "response_list": [
//           {
//             "status": "accept",
//             "ial": 2.3,
//             "private_proof_hash": "",
//             "aal": 2.2,
//             "identity_proof": "",
//             "valid_proof": null,
//             "idp_id": "mock_idp_2",
//             "valid_signature": null,
//             "signature": "this is signature",
//             "valid_ial": null
//           },
//           {
//             "status": "accept",
//             "ial": 2.3,
//             "private_proof_hash": "",
//             "aal": 2.2,
//             "identity_proof": "",
//             "valid_proof": null,
//             "idp_id": "mock_idp_1",
//             "valid_signature": null,
//             "signature": "this is signature",
//             "valid_ial": null
//           }
//         ],
//         "min_idp": 2,
//         "timed_out": false,
//         "min_aal": 2.2,
//         "data_request_list": [
//           {
//             "as_id_list": [
//               "ncb_as_2"
//             ],
//             "answered_as_id_list": [
//               "ncb_as_2"
//             ],
//             "request_params_hash": "XZVncUNW3Tmep5UiPuneZPQ2FTanWPB3E3Mgqy6/sFg=",
//             "received_data_from_list": [
//               "ncb_as_2"
//             ],
//             "service_id": "002.credit_info_001",
//             "min_as": 1
//           }
//         ],
//         "special": false,
//         "closed": true,
//         "request_id": "1de6e10b2933948cdca039081f5eacd02683e74b51db62e55da60d61dca558ba",
//         "min_ial": 2.3,
//         "request_message_hash": "nd//Vrgrr9UYKz/Tj3CQu56TQTmdGX7m2B3GlKomRzw=",
//         "mode": 1
//       },
//       "steps": [
//         {
//           "height": 5748,
//           "method": "CreateIdpResponse",
//           "nodeId": "mock_idp_1"
//         },
//         {
//           "height": 5747,
//           "method": "CreateIdpResponse",
//           "nodeId": "mock_idp_2"
//         },
//         {
//           "height": 5750,
//           "method": "SignData",
//           "nodeId": "ncb_as_2"
//         },
//         {
//           "height": 5745,
//           "method": "CreateRequest",
//           "nodeId": "ncb_rp_1"
//         },
//         {
//           "height": 5752,
//           "method": "SetDataReceived",
//           "nodeId": "ncb_rp_1"
//         },
//         {
//           "height": 5754,
//           "method": "CloseRequest",
//           "nodeId": "ncb_rp_1"
//         }
//       ],
//       "settlement":
//         {
//           "request_id": "1de6e10b2933948cdca039081f5eacd02683e74b51db62e55da60d61dca558ba",
//           "requester_node_id": "ncb_rp_1",
//           "height": 5748,
//           "idpList": [
//             {
//               "idp_id": "mock_idp_1",
//               "status": "accept",
//               "ial": 2.3,
//               "aal": 2.2,
//               "idp_fee_ratio": 1
//             },
//             {
//               "idp_id": "mock_idp_2",
//               "status": "accept",
//               "ial": 2.3,
//               "aal": 2.2,
//               "idp_fee_ratio": 0.5
//             }
//           ],
//           "asList": [
//             {
//               "as_id": "ncb_as_2",
//               "service_id": "002.credit_info_001"
//             }
//           ],
//           "closed": true
//         }
//     }
// }

function getIdpFullPrice(idpPriceList, nodeId, requestedAal, requestedIal) {
  const nodePriceList = idpPriceList[nodeId] || {};
  return (nodePriceList[requestedAal] && nodePriceList[requestedAal][requestedIal]) || 0;
}

function getAsFullPrice(asPriceList, nodeId, serviceId) {
  const nodePriceList = asPriceList[nodeId] || {};
  return nodePriceList[serviceId] || 0;
}

function createSummaryReport(objData, priceList) {
  const result = _.cloneDeep(objData);

  for (const rootName in result) {
    const { settlement } = result[rootName];
    const scopedPriceList = priceList
      .filter((item) => {
        if (item.max_block_height == null) {
          return settlement.height >= item.min_block_height;
        }
        return settlement.height >= item.min_block_height
          && settlement.height <= item.max_block_height;
      })[0].prices;
    settlement.idpList.forEach((dataInIdpList, index) => {
      const { idp_id, min_aal, min_ial } = dataInIdpList;
      const idp_full_price = getIdpFullPrice(scopedPriceList.idp, idp_id, min_aal, min_ial);
      const idp_price = idp_full_price * dataInIdpList.idp_fee_ratio;
      settlement.idpList[index] = { ...dataInIdpList, idp_price, idp_full_price };
    });
    settlement.asList.forEach((dataInAsList, index) => {
      const { as_id, service_id, as_fee_ratio } = dataInAsList;
      const as_full_price = getAsFullPrice(scopedPriceList.as, as_id, service_id);
      const as_price = as_full_price * as_fee_ratio;
      settlement.asList[index] = { ...dataInAsList, as_price, as_full_price };
    });
  }

  return result;
}

module.exports.createSummaryReport = createSummaryReport;
