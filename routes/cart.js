const db = require('../modules/db')

exports.get = (req, res) => {
	res.send(req.session.cart)
}

exports.update = (req, res) => {
	// id, quantity
	let optionid = req.params.oid
	let quantity = parseInt(req.params.quantity)

	if(typeof req.session.cart !== "undefined" && typeof req.session.cart[optionid] !== 'undefined'){
		if(quantity <= 0){
			delete req.session.cart[optionid]
		}else{
			req.session.cart[optionid].quantity = quantity
		}
		res.render('snippets/cart', {cart: (typeof req.session.cart !== "undefined" ? req.session.cart : {})})
	}
}

exports.create = (req, res) => {
	// create a unique id for the product options
	var optionid = req.query.id + req.query.color + req.query.size

	req.session.cart = (typeof req.session.cart === "undefined" ? {} : req.session.cart)

	if(typeof req.session.cart[optionid] !== 'undefined'){
		console.log(req.session.cart[optionid])
		req.session.cart[optionid].quantity += parseInt(req.query.quantity)
		res.render('snippets/cart', {cart: (typeof req.session.cart !== "undefined" ? req.session.cart : {})})
	}else{

		db.query('SELECT * FROM attribute_value WHERE attribute_value_id=?', [req.query.color], (err, result) => {
			if(err) throw err;

			let color = JSON.parse(JSON.stringify(result))[0].value
			db.query('SELECT * FROM attribute_value WHERE attribute_value_id=?', [req.query.size], (err, result) => {
				if(err) throw err;
				let size = JSON.parse(JSON.stringify(result))[0].value

				db.query('SELECT * FROM product WHERE product_id=?', [req.query.id], (err, result) => {
					if(err) throw err;
					let product = JSON.parse(JSON.stringify(result))[0]


					req.session.cart[optionid] = {
						color: color,
						size: size,
						product: product,
						quantity: parseInt(req.query.quantity)
					}
					res.render('snippets/cart', {cart: (typeof req.session.cart !== "undefined" ? req.session.cart : {})})
				})
			})
		})

	}
	
}

exports.delete = (req, res) => {
	if(typeof req.session.cart !== 'undefined' && typeof req.session.cart[req.params.oid] !== 'undefined'){
		delete req.session.cart[req.params.oid]
		res.render('snippets/cart', {cart: (typeof req.session.cart !== "undefined" ? req.session.cart : {})})
	}
}

exports.html = (req, res) => {
	res.render('snippets/cart', {cart: (typeof req.session.cart !== "undefined" ? req.session.cart : {})})
}



