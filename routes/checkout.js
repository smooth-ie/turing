const path = require('path')
require('dotenv').config({path: __dirname + '/.env'})
const db = require('../modules/db')
const cryptoRandomString = require('crypto-random-string');
const email = require('./email')

const stripe = require("stripe")(process.env.SECRET_KEY);

exports.charge = (req, res) => {
  let amount = 0;
  if(typeof req.session.cart !== 'undefined'){
	  for(let key in req.session.cart){
	  	let line = req.session.cart[key]
	  	let line_price = parseFloat((line.product.discounted_price > 0.0 ? line.product.discounted_price: line.product.price ))
	  	let cents = Math.round(line_price * 100)
	  	let line_total = cents * line.quantity
	  	amount += line_total
	  }
	}

	var order_id = cryptoRandomString({length: 16})

	if(amount > 0){ 
	  stripe.customers.create({
	    email: req.body.email,
	    card: req.body.id
	  })
	  .then(customer =>
	    stripe.charges.create({
	      amount,
	      description: "Turing Shop",
	      currency: "usd",
	      customer: customer.id,
	      metadata: {'order_id': order_id}
	    }))
	  .then(charge => {
	  	/**
	  	* if the charge was successful create the order and return the order_id
	  	*/

	  	//console.log('CHARGE:', charge);
	  	let data = {
	  		order_id: order_id,
	  		total_amount: charge.amount/100,
	  		email: charge.billing_details.name,
	  		auth_code: charge.id
	  	}
	  	//console.log('DATA:', data);
	  	db.query('INSERT INTO orders SET ?', [data], (err, result) => {
	  		if(err) throw err;

	  		let data = []
	  		for(let key in req.session.cart){
	  			let line = req.session.cart[key]

	  			data.push([
	  				order_id,
	  				line.product.product_id,
	  				JSON.stringify({color: line.color, size: line.size}),
	  				line.quantity,
	  				(line.product.discounted_price > 0.0 ? line.product.discounted_price: line.product.price )
	  			])
	  		}
	  		db.query('INSERT INTO order_detail (order_id, product_id, attributes, quantity, unit_cost) VALUES ?', [data], (err, result) => {
  				if (err) throw err;
  				delete req.session.cart
  				email.order_confirmation(charge.billing_details.name)
	  			res.send({order_id: order_id})
  			})
	  	})
	  	
	  })
	  .catch(err => {
	    console.log("Error:", err);
	    res.status(500).send({error: "Purchase Failed"});
	  });

	}else{
		res.status(500)
	}
};

exports.view = (req, res) => {
	res.render('checkout', {pk: process.env.STRIPE_PUBLISHABLE_KEY});
}