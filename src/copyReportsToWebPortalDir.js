const path = require('path');
const mkpath = require('mkpath');
const fs = require('fs-extra');
const { getDirectories } = require('./utils/pathUtil');
const { zipDir } = require('./utils/fileUtil');


async function copyReportsToWebPortalDir(
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

  for (const orgDirPath of orgDirPaths) {
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

    try {
      await zipDir(destDirPath, `${destDirPath}.zip`);
      console.log(`Zipping ${destDirPath} to ${destDirPath}.zip succeeded`);
    } catch (err) {
      console.error(`ERROR: Failed to zip ${destDirPath} to ${destDirPath}.zip`, err);
    }

    if (createLatest) {
      const latestDirPath = path.join(webPortalOrgDirPath, ...subDirs, 'latest');
      fs.removeSync(latestDirPath);
      fs.removeSync(`${latestDirPath}.zip`);

      try {
        fs.copySync(destDirPath, latestDirPath);
        console.log(`Copying ${destDirPath} to ${latestDirPath} (latest dir) succeeded`);
      } catch (err) {
        console.error(`ERROR: Failed to copy ${destDirPath} to ${latestDirPath} (latest dir)`, err);
      }

      try {
        await zipDir(latestDirPath, `${latestDirPath}.zip`);
        console.log(`Zipping ${latestDirPath} to ${latestDirPath}.zip succeeded`);
      } catch (err) {
        console.error(`ERROR: Failed to zip ${latestDirPath} to ${latestDirPath}.zip`, err);
      }
    }
  }
}

module.exports = {
  copyReportsToWebPortalDir,
};
