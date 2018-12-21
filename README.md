# ESave
ESave - CS361 - Fall18

This is the beginnings of an app which searches the web for products and associated promotions across multiple retailers, presenting the user a lowest cost option (for said searched products) accordingly. 

Users create accounts, generate order histories, and can save orders in "wish lists" or "favorites" lists. Additional features have been specified but are not yet implemented, such as the inclusion of price analysis tools and auto-generated notifications for price changes (for stored orders). Currently, the search engine supports only single product searches (multiple products can be input but only the first product will be returned) from a prepopulated database. Examples of searches that will yield a match include "honey", "playstaion", "echo", "783027454531" (a upc), "pajamas", "headphones", and "cat food". (All account passwords are stored in a safe, encrypted format.)


https://esave.herokuapp.com/

To view table contents: https://esave.herokuapp.com/dev1

To load sample data: https://esave.herokuapp.com/loadFakerData (password = loadfakedata)

To clear sample data: (password = clearfakedata)

ERD: https://www.lucidchart.com/invitations/accept/84d7eeea-faf2-4905-b715-91e382e00888

Dataflow Diagram: https://www.lucidchart.com/invitations/accept/09921db1-7466-441f-ab2d-ce57097d024e

*Access to database available upon request.*

Packages used include:
*express
*express-handlebars
*express-session
*body-parser
*cookie-parser
*morgan
*passport
*flash
*bcrypt
*faker

Database Engine: MySQL (via Heroku's ClearDB Add-On)
