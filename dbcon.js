var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'us-cdbr-iron-east-05.cleardb.net',
  user            : 'bf57ae5b87d78d',
  password        : '3d33c6b9',
  database        : 'heroku_6ad1e967f6f86fb',
  multipleStatements : true
});

module.exports.pool = pool;