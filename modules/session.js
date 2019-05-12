//session store initialization
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var options = {
    port: 3306,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DB
};
 
var sessionStore = new MySQLStore(options);


//for some reason this doesn't make a difference in spite of the fact that nginx forwards
//requests to express over http

// The session binds to the express app and is available for read/write in all routes. Ex: req.session.myvar = 1
function init(app){
    //app.set('trust proxy', 1)
    app.use(session({
        secret: process.env.SESSION_SECRET,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        //cookie: { secure: true }
    }));
}

module.exports = init

