const fs = require('fs');
const glob = require('glob');
const path = require('path');

function importNodeInfo(nodeInfoDirPath) {
  const filePaths = glob.sync(path.join(nodeInfoDirPath, '*.json'));
  const info = {};
  filePaths.forEach((fpath) => {
    const nodeId = path.basename(fpath, '.json');
    info[nodeId] = JSON.parse(fs.readFileSync(fpath));
    if (info[nodeId].node_name) {
      info[nodeId].node_name_obj = JSON.parse(info[nodeId].node_name);
    }
  });

  return info;
}

module.exports = { importNodeInfo };
