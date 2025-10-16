const dockerCompose = require('docker-compose');

module.exports = async () => {
  await dockerCompose.upAll();
};
