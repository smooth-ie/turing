const express = require('express')
const app = express()
const path = require('path')
var bodyParser = require('body-parser')
require('dotenv').config({path: __dirname + '/.env'})

require('./modules/session')(app)
const db = require('./modules/db')

const controller = require('./routes/controller')
const cart = require('./routes/cart')
const checkout = require('./routes/checkout')
const google = require('./routes/google')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', controller.index)
app.get('/department/:department', controller.department)
app.get('/category/:category', controller.category)
app.get('/product/:product', controller.product)
app.get('/order/:order_id', controller.order)
app.get('/account', controller.account)
app.get('/logout', controller.logout)


app.get('/cart/create', cart.create)
app.get('/cart/update/:oid/:quantity', cart.update)
app.get('/cart/delete/:oid', cart.delete)
app.get('/cart', cart.get)
app.get('/cart/html', cart.html)


app.post("/charge", checkout.charge)
app.get('/checkout', checkout.view)

app.get('/auth/google/callback', google.callback)


app.listen(3000)
