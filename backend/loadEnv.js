const path = require('path');
const dotenv = require('dotenv');

// Single shared env file at repo root: ../.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
