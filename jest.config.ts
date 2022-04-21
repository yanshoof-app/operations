const dotenv = require('dotenv');
const { join } = require('path');

dotenv.config({ path: join(__dirname, '.env.test.local') });
