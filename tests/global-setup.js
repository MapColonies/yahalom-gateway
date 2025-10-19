const dockerCompose = require('docker-compose');
const { Client } = require('pg');
const config = require('config');

module.exports = async () => {
  console.log('🚀 Starting Docker containers...');
  await dockerCompose.upAll({ log: true });
  console.log('✅ Docker containers are up');

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log('🔄 Checking for test database...');
  const dbConfig = config.get('db');

  const client = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: 'postgres',
  });

  try {
    await client.connect();

    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbConfig.name]);

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbConfig.name}";`);
      console.log(`✅ Created database: ${dbConfig.name}`);
    } else {
      console.log(`✅ Database already exists: ${dbConfig.name}`);
    }
  } catch (err) {
    console.error('❌ Failed to verify/create test database:', err);
    throw err;
  } finally {
    await client.end();
  }

  console.log('✅ global-setup complete');
};
