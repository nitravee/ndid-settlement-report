const _ = require('lodash');

function getNodeIdsFromSettlements(settlements = []) {
  return _.uniq(_.flatten(settlements.map(stmt =>
    [stmt.requester_node_id]
      .concat(stmt.idpList.map(idp => idp.idp_id))
      .concat(stmt.asList.map(as => as.as_id)))));
}

module.exports = {
  getNodeIdsFromSettlements,
};
