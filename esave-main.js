/*****************************************************************
** Main - ESave Web Server
** CS361 - SOFTWARE ENGINEERING I
** ---------------------------------------------------------------
** Main server engine. dev1 renders table views, for development
** purposes only.
*******************************************************************/
var express = require('express');
var app = express();
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var mysql = require('./dbcon.js');
var passport = require('passport');
var flash    = require('connect-flash');
//var path = require('path');

require('./passport.js')(passport);
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(bodyParser.json());

app.use(session({
	secret: 'XHsjsjhAUSGhajajhsUIahshT',
	resave: true,
	saveUninitialized: true
 } )); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// routes ======================================================================
require('./loginroutes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 5000);
app.set('mysql', mysql);

app.get('/dev1', (req, res, next) => {
	context = {};
	context.jsscriptsDevHomePage = ["tableSelectFE.js"];
	context.css = ["style.css", "homePageStyle.css"];
	res.render('dev1', context)
});

/*app.get('/search', (req, res, next) => {
	context = {};
	context.jsscriptsSearchPage = ["sparkle.jquery.js", "search.js", "eSave.js"];
	context.css = ["sparkle.css", "searchStyle.css"];
	context.navbarLogo = ["images/logo.jpg"];
	context.mainLogo = ["images/logo-medium.jpg"];
	console.log(req.query); //*************************
	if(req.query){

	}
		res.render('search/search', context)
});*/
app.use('/search', require('./searchRoute.js')());

app.use('/login', require('./loginroutes.js'));

//also leads to login page to prompt user to sign in when they first use the app
app.get('/', (req, res, next) => {
	res.redirect('/login');
});

//Note there is not yet a "home.handlebars" in the views directory,
//so this currently leads nowhere..."
// app.get('/home', (req,res,next) => {
// 	context = {};
// 	context.jsscriptsHomePage = ['tableSelectFE.js'];
// 	context.css = ["style.css", "homePageStyle.css"];
// 	res.render('home', context)
// });

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
app.use('/order_productTable', require('./tableSelectBE.js')("order_product"));
app.use('/order_promotionTable', require('./tableSelectBE.js')("order_promotion"));
app.use('/retailer_productTable', require('./tableSelectBE.js')("retailer_product"));
app.use('/favorites_retailerTable', require('./tableSelectBE.js')("favorites_retailer"));
app.use('/retailer_ratingTable', require('./tableSelectBE.js')("retailer_rating"));


app.use((req,res) => {
  res.status(404);
  res.render('404');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), () => {
  console.log('Express started on esave.herokuapp.com:' + app.get('port') + '; press Ctrl-C to terminate.');
});

/*******************************************************************************************************************
** References
** https://stackoverflow.com/questions/13151693/passing-arguments-to-require-when-loading-module/13151726#13151726
** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind
** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
** https://devcenter.heroku.com/articles/getting-started-with-nodejs
** https://devcenter.heroku.com/articles/git
** https://devcenter.heroku.com/articles/cleardb
** https://stackoverflow.com/questions/15463199/how-to-set-custom-favicon-in-express
** https://github.com/manjeshpv/node-express-passport-mysql/blob/master/views/signup.ejs
*******************************************************************************************************************/
