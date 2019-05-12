const path = require('path')
require('dotenv').config({path: __dirname + '/.env'})
var nodemailer = require('nodemailer')

exports.order_confirmation = (to) => {
	var transporter = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
	    user: process.env.GMAIL_ADDRESS,
	    pass: process.env.GMAIL_PASSWORD
	  }
	});

	var mailOptions = {
	  from: process.env.GMAIL_ADDRESS,
	  to: to,
	  subject: 'Order Confirmation',
	  text: 'Your order is on it\'s way.'
	};

	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
	    console.log(error);
	  } else {
	    console.log('Email sent: ' + info.response);
	  }
	});
}
