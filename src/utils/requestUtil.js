const _ = require('lodash');

function getNodeIdsFromSettlements(settlements = []) {
  return _.uniq(_.flatten(settlements.map(stmt =>
    [stmt.requester_node_id]
      .concat(stmt.idpList.map(idp => idp.idp_id))
      .concat(stmt.asList.map(as => as.as_id)))));
}

function checkIfRequestHasCloseStep(request) {
  return request.steps.filter(step => step.method === 'CloseRequest').length > 0;
}

function checkIfRequestHasTimeOutStep(request) {
  return request.steps.filter(step => step.method === 'TimeOutRequest').length > 0;
}

module.exports = {
  getNodeIdsFromSettlements,
  checkIfRequestHasCloseStep,
  checkIfRequestHasTimeOutStep,
};
