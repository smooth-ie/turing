const db = require('../modules/db')
const helper = require('./helper')
const google = require('./google')


exports.department = (req, res) => {
	//let category = {}
	db.query('SELECT * FROM department WHERE department_id=?', [req.params.department], (err, result) => {
		if (err) throw err;
		let detail = JSON.parse(JSON.stringify(result))[0]

		db.query('SELECT * FROM category WHERE department_id=?', [req.params.department], (err, result) => {
			if (err) throw err;
			let categories = JSON.parse(JSON.stringify(result))
			let promises = []
			for(category of categories){
				let promise = helper.get_category_sample(category.category_id)
				promise.catch( err => console.error(err) )
				promises.push(promise)
			}

			Promise.all(promises).then(
				categories => {
					let data = {
						department: detail,
						categories: categories
					}
					res.render('department', helper.always_send(data, req))
				}
			)
		})
	})
  	
}

exports.index = (req, res) => {
	let categories = [1, 2, 3]
	let promises = []
	for(category of categories){
		let promise = helper.get_category_sample(category)
		promise.catch( err => console.error(err) )
		promises.push(promise)
	}

	Promise.all(promises).then(
		categories => {
			let data = {
				categories: categories
			}
			res.render('index', helper.always_send(data, req))
		}
	)
}

exports.category = (req, res) => {
	let category_id = req.params.category
	let page = (typeof req.query.page !== 'undefined' ? parseInt(req.query.page) : 1)
	let min = (typeof req.query.min !== 'undefined' ? parseFloat(req.query.min) : 0.0)
	let max = (typeof req.query.max !== 'undefined' ? parseFloat(req.query.max) : 30.0)
	let size = (typeof req.query.size !== 'undefined' ? JSON.parse(req.query.size) : [])
	let color = (typeof req.query.color !== 'undefined' ? JSON.parse(req.query.color) : [])
	let q = (typeof req.query.q !== 'undefined' ? req.query.q : '')
	console.log(q)

	let inputs = { page: page, min: min, max: max, size: size, color: color, q: q }

	let page_size = 12
	let offset = (page - 1) * page_size
	
	let query = '\
	SELECT product.*, product_category.* \
	FROM product \
	JOIN product_category ON product.product_id = product_category.product_id \
	WHERE (product_category.category_id=? OR "all"=?) \
	'+ helper.filter_logic(size) + helper.filter_logic(color) +'\
	AND (product.name like ? OR product.description like ?)\
	AND \
	(\
	(discounted_price=0.0 AND price<=? AND price >= ?) OR \
	(discounted_price>0.0 AND discounted_price<=? AND discounted_price >= ?)\
	)\
	LIMIT ?,?'

	//console.log(query)
	let q_param = '%' + q + '%'
	let params = [category_id, category_id, q_param, q_param, max, min, max, min, offset, page_size + 1]

	db.query(query, params, (err, result) => {
		if (err) throw err;
		let products = JSON.parse(JSON.stringify(result))

		let pagination = {
			current: page,
			next: false,
			prev: (page > 1 ? page - 1 : false)
		}

		if(products.length > page_size){
			products.pop();
			pagination.next = page + 1;
		}

		let query = '\
		SELECT category.*, department.name AS department_name, department.description AS department_description \
		FROM category \
		JOIN department ON category.department_id = department.department_id \
		WHERE category_id=?'

		db.query(query, [category_id], (err, result) => {
			if (err) throw err;
			let categories = JSON.parse(JSON.stringify(result))
			//categories[0].category_id = req.params.category
			//if(!category.length || !products.length) // error not found

			let data = {
				products: products,
				pagination: pagination,
				category: categories[0],
				category_id: category_id, 
				filters: { min: min, max: max, size: size, color: color},
				inputs: inputs
			}
			data = helper.always_send(data, req)

			res.render('category', data)
		})

	})
}


exports.product = (req, res) => {
	let product_id = req.params.product

	db.query('SELECT p.*, pc.category_id FROM product p JOIN product_category pc ON p.product_id=pc.product_id WHERE p.product_id=?', [product_id], (err, result) => {
		if(err) throw err;
		let product = JSON.parse(JSON.stringify(result))[0]

		let query = '\
		SELECT av.attribute_value_id, value, name \
		FROM product_attribute pa \
		JOIN attribute_value av ON pa.attribute_value_id = av.attribute_value_id \
		JOIN attribute a ON av.attribute_id = a.attribute_id \
		WHERE product_id = ?'

		db.query(query, [product_id], (err, result) => {
			if(err) throw err;
			let attributes = JSON.parse(JSON.stringify(result));
			let attr = {}
			for(let attribute of attributes){
				if(typeof attr[attribute.name] === "undefined"){
					attr[attribute.name] = []
				}
				attr[attribute.name].push(attribute)
			}
			product['attributes'] = attr

			let query = '\
			SELECT p.*, pc.category_id \
			FROM product p \
			JOIN product_category pc ON p.product_id=pc.product_id \
			WHERE category_id = ? AND p.product_id!=?\
			LIMIT 0,4'

			//similar products
			db.query(query, [product.category_id, product.product_id], (err, result) => {
				if (err) throw err;

				let data = {
					product: product,
					similar: JSON.parse(JSON.stringify(result))
				}
				data = helper.always_send(data, req)
				
				res.render('product', data)
			})

			
		})
		
	})
}


exports.order = (req, res) => {
	let order_id = req.params.order_id
	db.query('SELECT * FROM orders WHERE order_id=?', [order_id], (err, result) => {
		if(err) throw err;
		let order = {}
		order['header'] = JSON.parse(JSON.stringify(result))[0]
		let query = 'SELECT * FROM order_detail od JOIN product p ON od.product_id=p.product_id WHERE order_id=?'
		db.query(query, [order_id], (err, result) => {
			if(err) throw err;
			order['lines'] = JSON.parse(JSON.stringify(result))

			let data = {
				order: order
			}
			data = helper.always_send(data, req)
			res.render('order', data)
		})

	})

}

exports.account = (req, res) => {
	if(typeof req.session.user === 'undefined'){
		res.status(403).end();
		return;
	}

	db.query('SELECT order_id FROM orders WHERE email=?', [req.session.user], (err, result) => {
		if (err) throw err;
		let order_ids = JSON.parse(JSON.stringify(result));

		let promises = []
		for(let order_id of order_ids){
			let promise = helper.get_order(order_id.order_id)
			promise.catch( err => console.error(err) )
			promises.push(promise)
		}
		
		Promise.all(promises).then(
			orders => {
				let data = {orders: orders}
				data = helper.always_send(data, req)
				res.render('account', data)
			}
		)
	})
}


exports.logout = (req, res) => {
	delete req.session.user
	res.redirect('/')
}






