const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    dbPath: process.env.DB_PATH
};