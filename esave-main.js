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
	context.jsscriptsDevHomePage = ['tableSelectFE.js'];
	context.css = ["style.css", "homePageStyle.css"];
	res.render('dev1', context)
});

//Note there is not yet a "home.handlebars" in the views directory,
//so this currently leads nowhere..."
app.get('/', function(req,res,next){
	context = {};
	context.jsscriptsHomePage = ['tableSelectFE.js'];
	context.css = ["style.css", "homePageStyle.css"];
	res.render('home', context)
});

//Table select routers ("middleware")
app.use('/userTable', require('./tableSelectBE.js')("user"));
app.use('/retailerTable', require('./tableSelectBE.js')("retailer"));
app.use('/productTable', require('./tableSelectBE.js')("product"));
app.use('/promotionTable', require('./tableSelectBE.js')("promotion"));
app.use('/orderTable', require('./tableSelectBE.js')("order"));
app.use('/reviewTable', require('./tableSelectBE.js')("review"));
app.use('/historyTable', require('./tableSelectBE.js')("history"));
app.use('/favorites_orderTable', require('./tableSelectBE.js')("favorites_order"));
app.use('/wish_listTable', require('./tableSelectBE.js')("wish_list"));
app.use('/messageTable', require('./tableSelectBE.js')("message"));
app.use('/order_userTable', require('./tableSelectBE.js')("order_user"));
app.use('/order_productTable', require('./tableSelectBE.js')("order_product"));
app.use('/order_promotionTable', require('./tableSelectBE.js')("order_promotion"));
app.use('/retailer_productTable', require('./tableSelectBE.js')("retailer_product"));
app.use('/promotion_ecouponTable', require('./tableSelectBE.js')("promotion_ecoupon"));
app.use('/favorites_retailerTable', require('./tableSelectBE.js')("favorites_retailer"));
app.use('/retailer_ratingTable', require('./tableSelectBE.js')("retailer_rating"));


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
	