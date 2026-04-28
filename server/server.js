require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./db/pool');

const PORT = process.env.PORT || 3001;

async function start() {
  // Verify DB is reachable before accepting traffic
  await testConnection();

  app.listen(PORT, () => {
    console.log(`\n🚀  LocalSEOExpert API running`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   ENV: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

start().catch((err) => {
  console.error('❌  Failed to start server:', err.message);
  process.exit(1);
});
