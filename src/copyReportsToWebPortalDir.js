const path = require('path');
const mkpath = require('mkpath');
const fs = require('fs-extra');
const { getDirectories } = require('./utils/pathUtil');


function copyReportsToWebPortalDir(
  outputDirPath,
  webPortalDirPath,
  subDirs = [],
  mktNameToWebPortalOrgDirNameMapping,
  createLatest,
) {
  console.log(JSON.stringify(mktNameToWebPortalOrgDirNameMapping, null, 2));
  const csvDirPath = path.join(outputDirPath, 'csv');
  const orgDirPaths = getDirectories(csvDirPath);

  const infoPath = path.join(outputDirPath, 'info.txt');

  orgDirPaths.forEach((orgDirPath) => {
    const orgName = orgDirPath.substr(orgDirPath.lastIndexOf('/') + 1);
    const webPortalOrgDirPath =
      path.join(webPortalDirPath, mktNameToWebPortalOrgDirNameMapping[orgName]);
    mkpath.sync(webPortalOrgDirPath);

    const execRoundDirName = outputDirPath.substr(outputDirPath.lastIndexOf('/') + 1);
    const destDirPath = path.join(webPortalOrgDirPath, ...subDirs, execRoundDirName);
    try {
      fs.copySync(infoPath, path.join(destDirPath, 'info.txt'));
      fs.copySync(orgDirPath, destDirPath);
      console.log(`${orgName} reports copied to ${destDirPath}`);
    } catch (err) {
      console.error(`ERROR: Failed to copy ${orgName} reports to ${destDirPath}`, err);
    }

    if (createLatest) {
      const latestDirPath = path.join(webPortalOrgDirPath, ...subDirs, 'latest');
      try {
        // NOTE: This is to remove existing symlink from old code (for migration purpose)
        fs.removeSync(latestDirPath);

        fs.copySync(destDirPath, latestDirPath);
        console.log(`Copying ${destDirPath} to ${latestDirPath} (latest dir) succeeded`);
      } catch (err) {
        console.error(`ERROR: Failed to copy symlink ${destDirPath} to ${latestDirPath}`, err);
      }
    }
  });
}

module.exports = {
  copyReportsToWebPortalDir,
};
