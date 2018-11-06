const tendermint = require('./tendermint');

const MAX_CONCURRENT_LIMIT = 3;

async function queryNodeInfo(nodeIds = []) {
  const nodeInfo = {};
  console.log(`Going to query node info of following node IDs: ${JSON.stringify(nodeIds, null, 2)}`);
  for (let i = 0; i < (nodeIds.length / MAX_CONCURRENT_LIMIT) + 1; i++) {
    const ids = nodeIds.slice(
      i * MAX_CONCURRENT_LIMIT,
      Math.min((i + 1) * MAX_CONCURRENT_LIMIT, nodeIds.length),
    );
    const results = await Promise.all(ids.map(async (id) => {
      console.log(`Querying node info of ${id} ...`);
      const info = await tendermint.query('GetNodeInfo', {
        node_id: id,
      });
      console.log(`Query node info of ${id} succeeded`);
      return {
        id,
        info: info || {},
      };
    }));

    results.forEach(({ id, info }) => {
      nodeInfo[id] = info;

      try {
        nodeInfo[id].node_name_obj = JSON.parse(nodeInfo[id].node_name);
      } catch (e) {
        console.warn(`Cannot parse node_name of node id: ${id}, node_name: ${nodeInfo[id].node_name}`);
      }
    });
  }

  return nodeInfo;
}

module.exports = { queryNodeInfo };
