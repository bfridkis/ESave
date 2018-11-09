/*****************************************************************
** Main - ESave Web Server
** CS361 - SOFTWARE ENGINEERING I
** ---------------------------------------------------------------
** Main server engine. dev1 renders table views, for development
** purposes only.
*******************************************************************/
var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var mysql = require('./dbcon.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 5000);
app.set('mysql', mysql);


app.get('/dev1', function(req, res, next){
	context = {};
	context.jsscriptsHomePage = ['tableSelect.js'];
	context.css = ["style.css", "homePageStyle.css"];
	res.render('dev1', context)
});


app.get('/', function(req,res,next){
	context = {};
	context.jsscriptsHomePage = ['tableSelect.js'];
	context.css = ["style.css", "homePageStyle.css"];
	res.render('home', context)
});


app.use('/userTable', require('./user/user.js').bind("user");
/*
app.use('/retailer', require('./retailer/retailer.js'));
app.use('/product', require('./product/product.js'));
app.use('/order', require('./order/order.js'));
app.use('/review', require('./review/review.js'));
app.use('/history', require('./history/history.js'));
app.use('/favorites_order', require('./favorites_order/favorites_order.js'));
app.use('/wish_list', require('./wish_list/wish_list.js'));
app.use('/message', require('./message/message.js'));
app.use('/order_product', require('./order_product/order_product.js'));
app.use('/retailer_product', require('./retailer_product/retailer_product.js'));
app.use('/promotion_ecoupon', require('./promotion_ecoupon/promotion_ecoupon.js'));
app.use('/favorites_retailer', require('./favorites_retailer/favorites_retailer.js'));
*/


app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on esave.herokuapp.com:' + app.get('port') + '; press Ctrl-C to terminate.');
});
	