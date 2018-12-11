function logFileCreated(fileNameWithExt, destDirPath) {
  console.log(`${fileNameWithExt} created at ${destDirPath}`);
}

module.exports = {
  logFileCreated,
};
