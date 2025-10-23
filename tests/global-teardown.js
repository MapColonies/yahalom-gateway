const dockerCompose = require('docker-compose');

module.exports = async () => {
  console.log('🧹 Stopping Docker containers...');
  await dockerCompose.down();
  console.log('✅ Docker containers stopped');
};
