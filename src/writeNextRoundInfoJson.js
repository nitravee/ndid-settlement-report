const fs = require('fs');

function writeNextRoundInfoJson(chainId, nextMinBlockHeight, jsonFilePath) {
  const nextRound = {
    chain_id: chainId,
    min_block_height: nextMinBlockHeight,
  };

  fs.writeFileSync(jsonFilePath, JSON.stringify(nextRound, null, 2));
}

module.exports = {
  writeNextRoundInfoJson,
};
