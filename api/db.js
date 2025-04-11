const Pool = require('pg').Pool
const pool = new Pool({
    user: "postgres",
    password: 'xxXX1234',
    host: 'localhost',
    port: 5432,
    database: "confectionery"
})

module.exports = pool