var mysql = require('mysql');
var connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_DB
});

connection.connect(function(err) {
    if (err){ console.log(err) };
});


module.exports = connection;