const path = require('path');
const mkpath = require('mkpath');
const fs = require('fs-extra');
const { getDirectories } = require('./utils/pathUtil');


function copyReportsToWebPortalDir(
  outputDirPath,
  webPortalDirPath,
  subDirs = [],
  createLatestSymlink,
) {
  const csvDirPath = path.join(outputDirPath, 'csv');
  const orgDirPaths = getDirectories(csvDirPath);

  const infoPath = path.join(outputDirPath, 'info.txt');
  const pendingCsvPath = path.join(csvDirPath, 'pending.csv');

  orgDirPaths.forEach((orgDirPath) => {
    const orgName = orgDirPath.substr(orgDirPath.lastIndexOf('/') + 1);
    const webPortalOrgDirPath = path.join(webPortalDirPath, orgName);
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

    if (createLatestSymlink) {
      const latestSymlinkPath = path.join(webPortalOrgDirPath, ...subDirs, 'latest');
      try {
        fs.removeSync(latestSymlinkPath);
        fs.ensureSymlinkSync(destDirPath, latestSymlinkPath);
        console.log(`Symlink ${latestSymlinkPath} to ${destDirPath} created`);
      } catch (err) {
        console.error(`ERROR: Failed to create symlink ${latestSymlinkPath} to ${destDirPath}`, err);
      }
    }
  });
}

module.exports = {
  copyReportsToWebPortalDir,
};
