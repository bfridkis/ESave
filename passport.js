// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var mysql = require('./dbcon.js');
var bcrypt = require('bcrypt-nodejs');

// expose this function to our app using module.exports
module.exports = function(passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    mysql.pool.query("SELECT * FROM user WHERE id = ? ", [id], function(err, rows) {
      done(err, rows[0]);
    });
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use(
    'local-signup',
    new LocalStrategy({

        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
      },
      function(req, username, password, done) {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        mysql.pool.query("SELECT * FROM user WHERE username = ?", [username], function(err, rows) {
          if (err)
            return done(err);
          //check username
          if (rows.length) {
            return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
          } else {

            mysql.pool.query("SELECT * FROM user WHERE email = ?", req.body.email, function(err, rows) {
              if (rows.length) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
              } else {
                // if there is no user with that username or email

                //we check if the two password fields match
                if (password != req.body.passwordrepeat)
                {
                  return done(null, false, req.flash('signupMessage', 'Passwords do not match. Please try again.'));
                }

                else {
                  // otherwise, create the user
                  var newUserMysql = {
                    username: username,
                    password: bcrypt.hashSync(password, null, null), // use the generateHash function in our user model
                    email: req.body.email,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname
                  };

                  var insertQuery = "INSERT INTO user ( username, password, email, first_name, last_name ) values (?,?,?,?,?)";

                  mysql.pool.query(insertQuery, [newUserMysql.username, newUserMysql.password, newUserMysql.email, newUserMysql.firstname, newUserMysql.lastname], function(err, rows) {
                    newUserMysql.id = rows.insertId;

                    return done(null, newUserMysql);
                  });
                }
              }
            });
          }
        });
      })
  );

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use(
    'local-login',
    new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
      },
      function(req, username, password, done) { // callback with username and password from our form
        mysql.pool.query("SELECT * FROM user WHERE username = ?", [username], function(err, rows) {
          if (err)
            return done(err);
          if (!rows.length) {
            return done(null, false, req.flash('loginMessage', 'You have entered an invalid username or password')); // req.flash is the way to set flashdata using connect-flash
          }

          // if the user is found but the password is wrong
          if (!bcrypt.compareSync(password, rows[0].password))
            return done(null, false, req.flash('loginMessage', 'You have entered an invalid username or password')); // create the loginMessage and save it to session as flashdata

          // all is well, return successful user
          return done(null, rows[0]);
        });
      })
  );
};

/*
References:https://github.com/manjeshpv/node-express-passport-mysql

*/
