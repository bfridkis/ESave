# ESave
ESave - CS361 - Fall18

This is the beginnings of an app which searches the web for products and associated promotions across multiple retailers, presenting the user a lowest cost option (for said searched products) accordingly. 

Users create accounts, generate order histories, and can save orders in "wish lists" or "favorites" lists. Additional features have been specified but are not yet implemented, such as the inclusion of price analysis tools and auto-generated notifications for price changes (for stored orders). Currently, the search engine supports only single product searches (multiple products can be input but only the first product will be returned) from a prepopulated database. Examples of searches that will yield a match include "honey", "playstaion", "echo", "783027454531" (a upc), "pajamas", "headphones", and "cat food". (All account passwords are stored in a safe, encrypted format.)


https://esave.herokuapp.com/

To view table contents: https://esave.herokuapp.com/dev1

Packages used include:
*express
*handlebars
*morgan
*passport
*express-session
*flash
*bcrypt

Database Engine: MySQL (via Heroku's ClearDB Add-On)
