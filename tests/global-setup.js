const dockerCompose = require('docker-compose');

module.exports = async () => {
  console.log('🟢 Starting Docker containers...');
  await dockerCompose.upAll({ commandOptions: ['--remove-orphans'] });

  console.log('🚀 Environment ready for tests');
};
