const {google} = require('googleapis');
const db = require('../modules/db')

/*******************/
/** CONFIGURATION **/
/*******************/

const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirect: process.env.GOOGLE_REDIRECT_URL
};

const defaultScope = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/userinfo.email',
];

/*************/
/** HELPERS **/
/*************/

function createConnection() {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  );
}

function getConnectionUrl(auth) {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope
  });
}

function getGooglePlusApi(auth) {
  return google.plus({ version: 'v1', auth });
}

/**********/
/** MAIN **/
/**********/

/**
 * Part 1: Create a Google URL and send to the client to log in the user.
 */
exports.url = () => {
  const auth = createConnection();
  const url = getConnectionUrl(auth);
  return url;
}

/**
 * Part 2: Take the "code" parameter which Google gives us once when the user logs in, then get the user's email and id.
 */
let getGoogleAccountFromCode = (code) => {
  return new Promise( (resolve, reject) => {
    const auth = createConnection();
    auth.getToken(code).then(
      data => {
        const tokens = data.tokens;
        auth.setCredentials(tokens);
        const plus = getGooglePlusApi(auth);
        plus.people.get({ userId: 'me' }).then(
          me => {
            const userGoogleId = me.data.id;
            const userGoogleEmail = me.data.emails && me.data.emails.length && me.data.emails[0].value;
            resolve( {
              id: userGoogleId,
              email: userGoogleEmail,
              tokens: tokens,
            } )
          }
        ).catch( err => reject(err) )      
      }
    ).catch( err => reject(err) );
  } );
}

/*
* If there is a user, check against DB, using insert / update. 
*/
exports.callback = (req, res) => {
  getGoogleAccountFromCode(req.query.code).then(
    user => {
      //res.send(user);
      let data = { email: user.email }
      db.query('INSERT INTO customer SET ? ON DUPLICATE KEY UPDATE ?', [data, data], (err, result) => {
        if(err) throw err;
        req.session.user = user.email
        res.redirect('/account')
      })
    }
  ).catch( err => console.error(err) )
}




