import { config } from 'dotenv';
import { join } from 'path';

const rootDir = process.cwd();
const isProduction = process.env.NODE_ENV == 'production';
const FILES = {
  production: join(rootDir, '.env.prod'),
  local: join(rootDir, '.env.local'),
};
const envFile = isProduction ? FILES['production'] : FILES['local'];

// config env
console.log('INFO | Retrieving environment from ', envFile);
config({ path: envFile });
