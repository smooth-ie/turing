const google = require('./google')
const db = require('../modules/db')

exports.filter_logic = (arr) => {
	if (!arr.length) return '';
	let start = 'AND EXISTS( SELECT 1 FROM product_attribute pa WHERE pa.product_id=product.product_id AND ('
	let ret = start
	for(let val of arr){
		ret += (ret != start ? ' OR ' : '') + 'pa.attribute_value_id=' + parseInt(val)
	}
	ret += ')) '
	return ret;
}

exports.always_send = (arr, req) => {
	arr['color_table'] = [
		{value: 6, color: '#fff'},
		{value: 7, color: '#000'},
		{value: 8, color: '#f00'},
		{value: 9, color: '#fa0'},
		{value: 10, color: '#ff0'},
		{value: 11, color: '#0f0'},
		{value: 12, color: '#00f'},
		{value: 13, color: '#4b0082'},
		{value: 14, color: '#808'}
	];
	arr['size_table'] = [
		{value: 1, title: 'S'},
		{value: 2, title: 'M'},
		{value: 3, title: 'L'},
		{value: 4, title: 'XL'},
		{value: 5, title: 'XXL'}
	];
	arr['google_url'] =  google.url()
	arr['user'] = (typeof req.session.user !== "undefined" ? req.session.user : false)
	arr['cart_closed'] = true;
	arr['cart'] = (typeof req.session.cart !== "undefined" ? req.session.cart : {})
	return arr
}




exports.get_order = (order_id) => {
	return new Promise( (resolve, reject) => {
		db.query('SELECT * FROM orders WHERE order_id=?', [order_id], (err, result) => {
			if(err) reject(err);
			let order = {}
			order['header'] = JSON.parse(JSON.stringify(result))[0]
			let query = 'SELECT * FROM order_detail od JOIN product p ON od.product_id=p.product_id WHERE order_id=?'
			db.query(query, [order_id], (err, result) => {
				if(err) reject(err);
				order['lines'] = JSON.parse(JSON.stringify(result))
				resolve(order);
			})
		})
	})
}



exports.get_category_sample = (category_id) => {
	return new Promise( (resolve, reject) => {
		db.query('SELECT * FROM category WHERE category_id=?', [category_id], (err, result) => {
			if(err) reject(err);
			let detail = JSON.parse(JSON.stringify(result))[0];

			let query = '\
					SELECT p.*, pc.category_id \
					FROM product p \
					JOIN product_category pc ON p.product_id=pc.product_id \
					WHERE category_id = ? \
					LIMIT 0,4'

			db.query(query, [category_id], (err, result) => {
				if (err) reject(err);
				let products = JSON.parse(JSON.stringify(result))
				resolve({detail: detail, products: products})
			})
		})
	} )
}





