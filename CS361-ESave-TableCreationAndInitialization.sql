-- Table Definitions and Sample Data Entry - ESave
-- CS361 - SOFTWARE ENGINEERING I
-- -------------------------------------------------

-- Drop Tables IF Previously Existing
DROP TABLE IF EXISTS `retailer_rating`;
DROP TABLE IF EXISTS `favorites_retailer`;
DROP TABLE IF EXISTS `promotion_ecoupon`;
DROP TABLE IF EXISTS `retailer_product`;
DROP TABLE IF EXISTS `order_promotion`;
DROP TABLE IF EXISTS `order_product`;
DROP TABLE IF EXISTS `order_user`;
DROP TABLE IF EXISTS `message`;
DROP TABLE IF EXISTS `wish_list`;
DROP TABLE IF EXISTS `favorites_order`;
DROP TABLE IF EXISTS `history`;
DROP TABLE IF EXISTS `review`;
DROP TABLE IF EXISTS `order`;
DROP TABLE IF EXISTS `promotion`;
DROP TABLE IF EXISTS `product`;
DROP TABLE IF EXISTS `retailer`;
DROP TABLE IF EXISTS `user`;


-- USER TABLE --
-- id - an auto incrementing integer which is the primary key
-- username - a varchar of maximum length 255, cannot be null
-- password - a varchar of maximum length 255, cannot be null
-- email - a varchar of maximum length 255, cannot be null
-- shipping_address - a varchar of maximum length 255, cannot be null
-- billing_address - a varchar of maximum length 255, cannot be null
-- recommendations - a boolean flag to indicate if user can be sent recommendations
-- price_drop_email - a boolean flag to indicate if user can be sent emails when saved
--					  orders (i.e. those on wish list or favories) see a lowest price 
--					  drop
-- message_email - a boolean flag to indicate if user can be sent email notifications
--				   when new ESave messages are received
-- ** Constraints **
-- -- username must be unique

CREATE TABLE `user` (
  `id` int(15) AUTO_INCREMENT NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `shipping_address` varchar(255) NOT NULL,
  `billing_address` varchar(255) NOT NULL,
  `recommendations` boolean,
  `price_drop_email` boolean,
  `message_email` boolean,
  PRIMARY KEY (`id`),
  CONSTRAINT `unique_user_username` UNIQUE (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- RETAILER TABLE --
-- id - an auto incrementing integer which is the primary key
-- name - a varchar of maximum length 255, cannot be null
-- web_address - a varchar of maximum length 255, cannot be null
-- mailing_address - a varchar of maximum length 255, cannot be null
-- rating - an int
-- ** Constraints **
-- -- name must be unique

CREATE TABLE `retailer` (
  `id` int(15) AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `web_address` varchar(255) NOT NULL,
  `mailing_address` varchar(255),
  PRIMARY KEY (`id`),
  CONSTRAINT `unique_retailer_name` UNIQUE (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- PRODUCT TABLE --
-- id - an auto incrementing integer which is the primary key
-- name - a varchar of maximum length 255, cannot be null
-- price - a decimal value, cannot be null
-- isbn - a 13-digit int, cannot be null
-- model_number - a varchar of maximum length 255
-- ** Constraints **
-- -- upc must be unique

CREATE TABLE `product` (
  `id` int(15) AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `upc` int(12),
  `model_number` varchar(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- PROMOTION TABLE --
-- id - an auto incrementing integer which is the primary key
-- discount - a floating point value
-- retailer - a int corresponding to a retailer entry (foreign key)
-- description - text with max 65,535 characters
-- ecoupon - a varchar(255) to hold ecoupon code (if applicable)

CREATE TABLE `promotion` (
  `id` int(15) AUTO_INCREMENT NOT NULL,
  `discount` decimal (8,2),
  `retailer` int(15) NOT NULL,
  `description` text,
  `ecoupon` varchar(255),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_promotion_retailer` FOREIGN KEY (`retailer`) REFERENCES `retailer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ORDER TABLE --
-- id - an auto incrementing integer which is the primary key
-- price - a decimal value, cannot be null
-- retailer - an int corresponding to a retailer entry (foreign key)

CREATE TABLE `order` (
  `id` int(15) AUTO_INCREMENT NOT NULL,
  `price` decimal(9,2) NOT NULL,
  `retailer` int(15) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_order_retailer` FOREIGN KEY (`retailer`) REFERENCES `retailer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- REVIEW TABLE --
-- order - an int corresponding to an order entry (foreign key and primary key)
-- rating - a int
-- feedback - text (max length 65,535 characters)
-- ** Constraints **
-- -- order must be unique (foreign key & primary key) - references order `id`

CREATE TABLE `review` (
  `order` int(15) NOT NULL,
  `rating` int(1),
  `feedback` text,
  PRIMARY KEY (`order`),
  CONSTRAINT `fk_review_order` FOREIGN KEY (`order`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- HISTORY TABLE --
-- order - an auto incrementing integer which is the primary key
-- purchased - a boolean, cannot be null
-- user - an int corresponding to a user (foreign key)
-- timestamp - timestamp indicating search datetime

CREATE TABLE `history` (
  `order` int(15) NOT NULL,
  `purchased` boolean NOT NULL,
  `user` int(15) NOT NULL,
  `timestamp` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (`order`, `user`, `timestamp`),
  CONSTRAINT `fk_history_order` FOREIGN KEY (`order`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_history_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- FAVORITES_ORDER TABLE --
-- user - an int corresponding to a user (foreign key)
-- order - an int corresponding to an order (foreign key)

CREATE TABLE `favorites_order` (
  `user` int(15) NOT NULL,
  `order` int(15) NOT NULL,
  PRIMARY KEY (`user`, `order`),
  CONSTRAINT `fk_favorites_order_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorites_order_order` FOREIGN KEY (`order`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- WISH_LIST TABLE --
-- user - an int corresponding to a user (foreign key)
-- order - an int corresponding to an order (foreign key)

CREATE TABLE `wish_list` (
  `user` int(15) NOT NULL,
  `order` int(15) NOT NULL,
  PRIMARY KEY (`user`, `order`),
  CONSTRAINT `fk_wish_list_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_wish_list_order` FOREIGN KEY (`order`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- messages TABLE --
-- id - an auto incrementing integer which is the primary key
-- data - text (max length 65,535 characters)
-- recipient - an int corresponding to a user (foreign key)
-- sender - an int corresponding to a user (foreign key)
-- date - a timestamp
-- message_thread - an int to group messages into threads

CREATE TABLE `message` (
  `id` int(15) AUTO_INCREMENT NOT NULL,
  `data` text NOT NULL,
  `recipient` int(15) NOT NULL,
  `sender` int(15) NOT NULL,
  `timestamp` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  `message_thread` int(15) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_message_recipient` FOREIGN KEY (`recipient`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_message_sender` FOREIGN KEY (`sender`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ORDER_USER TABLE --
-- order - an int corresponding to an order (foreign key)
-- user - an int corresponding to a user (foreign key)

CREATE TABLE `order_user` (
  `order` int(15) NOT NULL,
  `user` int(15) NOT NULL,
  PRIMARY KEY (`order`, `user`),
  CONSTRAINT `fk_order_user_order` FOREIGN KEY (`order`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_user_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ORDER_PRODUCT TABLE --
-- order - an int corresponding to an order (foreign key)
-- product - an int corresponding to a product (foreign key)
-- quantity - an int for product quantity (max 999,999)

CREATE TABLE `order_product` (
  `order` int(15) NOT NULL,
  `product` int(15) NOT NULL,
  `quantity` int(6),
  PRIMARY KEY (`order`, `product`),
  CONSTRAINT `fk_order_product_order` FOREIGN KEY (`order`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_product_product` FOREIGN KEY (`product`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ORDER_PROMOTION TABLE --
-- order - an int corresponding to an order (foreign key)
-- promotion - an int corresponding to a promotion (foreign key)

CREATE TABLE `order_promotion` (
  `order` int(15) NOT NULL,
  `promotion` int(15) NOT NULL,
  PRIMARY KEY (`order`, `promotion`),
  CONSTRAINT `fk_order_promotion_order` FOREIGN KEY (`order`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_promotion_promotion` FOREIGN KEY (`promotion`) REFERENCES `promotion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- RETAILER_PRODUCT TABLE --
-- retailer - an int corresponding to an retailer (foreign key)
-- product - an int corresponding to a product (foreign key)

CREATE TABLE `retailer_product` (
  `retailer` int(15) NOT NULL,
  `product` int(15) NOT NULL,
  `retailer_description` text,
  PRIMARY KEY (`retailer`, `product`),
  CONSTRAINT `fk_retailer_product_retailer` FOREIGN KEY (`retailer`) REFERENCES `retailer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_retailer_product_product` FOREIGN KEY (`product`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- FAVORITES_RETAILER TABLE --
-- user - an int corresponding to a user (foreign key)
-- retailer - an int corresponding to a retailer (foreign key)

CREATE TABLE `favorites_retailer` (
  `user` int(15) NOT NULL,
  `retailer` int(15) NOT NULL,
  PRIMARY KEY (`user`, `retailer`),
  CONSTRAINT `fk_favorites_retailer_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorites_retailer_retailer` FOREIGN KEY (`retailer`) REFERENCES `retailer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- RETAILER_RATING TABLE --
-- user - an int corresponding to a user (foreign key)
-- retailer - an int corresponding to a retailer (foreign key)

CREATE TABLE `retailer_rating` (
  `user` int(15) NOT NULL,
  `retailer` int(15) NOT NULL,
  `rating` int(1) NOT NULL,
  PRIMARY KEY (`user`, `retailer`),
  CONSTRAINT `fk_retailer_rating_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_retailer_rating_retailer` FOREIGN KEY (`retailer`) REFERENCES `retailer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ************************************ INSERTIONS **************************************

-- USER TABLE INSERTIONS --
INSERT INTO user values (1, 'fridkisb', 'ESaveRules', 'fridkisb@oregonstate.edu', '1234 Lone Star,
						 TX, 77042', '1234 Lone Star, TX, 77042', TRUE, TRUE, TRUE);
					
-- RETAILER TABLE INSERTIONS --
INSERT INTO retailer values (1, 'Thrive Market', 'thrivemarket.com', NULL);

-- PRODUCT TABLE INSERTIONS --
INSERT INTO product values (1, 'Really Raw Honey', 720054111124, NULL);
	
-- PROMOTION TABLE INSERTIONS --
INSERT INTO promotion values (1, 20, 1, 
	'$20 Off Your First Three Orders Over $49 + Free Shipping (requires thrive membership)', 'bd20x3');
	
-- ORDER TABLE INSERTIONS --
INSERT INTO `order` values (1, 31.96, 1);

-- REVIEW TABLE INSERTIONS --
INSERT INTO review values (1, 5, 'Excellent products! Loved the $20 off promotion!');

-- HISTORY TABLE INSERTIONS --
INSERT INTO history values (1, TRUE, 1, '2018-11-09 10:49:21');

-- FAVORITES_ORDER TABLE INSERTIONS --
INSERT INTO favorites_order values (1, 1);

-- WISH_LIST TABLE INSERTIONS --
INSERT INTO wish_list values (1, 1);

-- MESSAGE TABLE INSERTIONS --
INSERT INTO message values (1, 'Why would I send a message to myself? Because there are no other users!
								(What user id should we use here [for sender] for messages generated by ESave?
								Perhaps 0?)', 1, 1, '2018-11-09 10:49:21', 1);
								
-- ORDER_USER TABLE INSERTIONS --
INSERT INTO order_user values (1, 1);
								
-- ORDER_PRODUCT TABLE INSERTIONS --
INSERT INTO order_product values (1, 1, 4);

-- ORDER_PROMOTION TABLE INSERTIONS --
INSERT INTO order_promotion values (1, 1);

-- RETAILER_PRODUCT TABLE INSERTIONS --
INSERT INTO retailer_product values (1, 1, 
	'Really Raw Unstrained Honey takes honey straight from the hive to the jar. It’s not heated and cooled, 
	nor does Really Raw filter out the honeycomb or pollen like most conventional brands do. Raw honey is great 
	to use as a natural sweetener since it has fewer carbs than sugar, and is less likely to cause blood sugar 
	spikes or sugar crashes.');
	
-- FAVORITES_RETAILER TABLE INSERTIONS --
INSERT INTO favorites_retailer values (1, 1);

-- RETAILER_RATING TABLE INSERTIONS --
INSERT INTO retailer_rating values (1, 1, 5);

-- Works Referenced
-- -- https://www.w3schools.com/sql/sql_datatypes.asp
-- -- https://dev.mysql.com/doc/refman/8.0/en/blob.html
-- -- https://dev.mysql.com/doc/refman/8.0/en/string-type-overview.html
-- -- https://stackoverflow.com/questions/23515347/how-can-i-fix-mysql-error-1064