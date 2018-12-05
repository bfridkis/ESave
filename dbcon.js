var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'us-cdbr-iron-east-01.cleardb.net',
  user            : 'ba1f2b48b756b7',
  password        : 'process.env.password',
  database        : 'heroku_fa0c8c6c2b62722',
  multipleStatements : true
});

module.exports.pool = pool;
