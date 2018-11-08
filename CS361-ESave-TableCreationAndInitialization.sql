-- Table Definitions and Sample Data Entry - ESave
-- CS361 - SOFTWARE ENGINEERING I
-- -------------------------------------------------

-- Drop Tables IF Previously Existing
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `product`;
DROP TABLE IF EXISTS `review`;
DROP TABLE IF EXISTS `history`;
DROP TABLE IF EXISTS `favorites_order`;
DROP TABLE IF EXISTS `wish_list`;
DROP TABLE IF EXISTS `message`;
DROP TABLE IF EXISTS `order_product`;
DROP TABLE IF EXISTS `retailer_product`;
DROP TABLE IF EXISTS `promotion_ecoupon`;
DROP TABLE IF EXISTS `favorites_retailer`;
DROP TABLE IF EXISTS `ecoupon`;
DROP TABLE IF EXISTS `promotion`;
DROP TABLE IF EXISTS `order`;
DROP TABLE IF EXISTS `retailer`;


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
  CONSTRAINT `unique_username` UNIQUE (`username`)
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
  `rating` int,
  PRIMARY KEY (`id`),
  CONSTRAINT `unique_name` UNIQUE (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- PRODUCT TABLE --
-- id - an auto incrementing integer which is the primary key
-- name - a varchar of maximum length 255, cannot be null
-- price - a decimal value, cannot be null
-- isbn - a 13-digit int, cannot be null
-- model_number - a varchar of maximum length 255
-- ** Constraints **
-- -- isbn must be unique

CREATE TABLE `product` (
  `id` int(15) AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(9,2) NOT NULL,
  `isbn` int(13) NOT NULL,
  `model_number` varchar(255),
  PRIMARY KEY (`id`),
  CONSTRAINT `unique_isbn` UNIQUE (`isbn`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- PROMOTION TABLE --
-- id - an auto incrementing integer which is the primary key
-- discount - a floating point value
-- retailer - a int corresponding to a retailer entry (foreign key)
-- description - a varchar of maximum length 255

CREATE TABLE `promotion` (
  `id` int(15) AUTO_INCREMENT NOT NULL,
  `discount` float,
  `retailer` int NOT NULL,
  `description` varchar(255),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_retailer` FOREIGN KEY (`retailer`) REFERENCES `retailer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ECOUPON TABLE --
-- id - an auto incrementing integer which is the primary key
-- code - a varchar of maximum length 255, cannot be null
-- promotion - a int corresponding to a promotion entry (foreign key)
-- description - a varchar of maximum length 255

CREATE TABLE `ecoupon` (
  `id` int(15) AUTO_INCREMENT NOT NULL,
  `code` varchar(255),
  `promotion` int NOT NULL,
  `description` varchar(255),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_promotion` FOREIGN KEY (`promotion`) REFERENCES `promotion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ORDER TABLE --
-- id - an auto incrementing integer which is the primary key
-- price - a decimal value, cannot be null
-- retailer - an int corresponding to a retailer entry (foreign key)

CREATE TABLE `order` (
  `id` int(15) AUTO_INCREMENT NOT NULL,
  `price` decimal (9,2) NOT NULL,
  `retailer` int NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_retailer` FOREIGN KEY (`retailer`) REFERENCES `retailer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- REVIEW TABLE --
-- order - an int corresponding to an order entry (foreign key and primary key)
-- rating - a int
-- feedback - text (max length 65,535 characters)
-- ** Constraints **
-- -- order must be unique (foreign key & primary key) - references order `id`

CREATE TABLE `review` (
  `order` int(15) NOT NULL,
  `rating` int,
  `feedback` text,
  PRIMARY KEY (`order`),
  CONSTRAINT `fk_order` FOREIGN KEY (`order`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- HISTORY TABLE --
-- order - an auto incrementing integer which is the primary key
-- purchased - a boolean, cannot be null
-- user - an int corresponding to a user (foreign key)
-- timestamp - timestamp indicating search datetime
-- price - a decimal value, cannot be null

CREATE TABLE `history` (
  `order` int(15) NOT NULL,
  `purchased` boolean NOT NULL,
  `user` varchar(255) NOT NULL,
  `timestamp` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  `price` decimal(9,2) NOT NULL,
  PRIMARY KEY (`order`, `user`, `timestamp`),
  CONSTRAINT `fk_order` FOREIGN KEY (`order`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- FAVORITES_ORDER TABLE --
-- user - an int corresponding to a user (foreign key)
-- order - an int corresponding to an order (foreign key)

CREATE TABLE `favorites_order` (
  `user` int(15) NOT NULL,
  `order` int(15) NOT NULL,
  PRIMARY KEY (`user`, `order`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order` FOREIGN KEY (`order`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- WISH_LIST TABLE --
-- id - an auto incrementing integer which is the primary key
-- review - an int corresponding to a review (foreign key)

CREATE TABLE `wish_list` (
  `user` int(15) NOT NULL,
  `order` int(15) NOT NULL,
  PRIMARY KEY (`user`, `order`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order` FOREIGN KEY (`order`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- messages TABLE --
-- id - an auto incrementing integer which is the primary key
-- data - text (max length 65,535 characters)
-- recipient - an int corresponding to a user (foreign key)
-- sender - an int corresponding to a user (foreign key)
-- date - a timestamp
-- message_thread - an int to group messages into threads
-- ** Constraints **
-- -- user must be unique (foreign key) - references user `id`
-- -- order must be unique (foreign key) - references order `id`

CREATE TABLE `message` (
  `id` int(15) AUTO_INCREMENT NOT NULL,
  `data` text NOT NULL,
  `recipient` int NOT NULL,
  `sender` int NOT NULL,
  `date` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  `message_thread int NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_recipient` FOREIGN KEY (`recipient`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sender` FOREIGN KEY (`sender`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ORDER_PRODUCT TABLE --
-- order - an int corresponding to an order (foreign key)
-- product - an int corresponding to a product (foreign key)

CREATE TABLE `order_product` (
  `order` int(15) NOT NULL,
  `product` int(15) NOT NULL,
  PRIMARY KEY (`order`, `product`),
  CONSTRAINT `fk_order` FOREIGN KEY (`order`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_product` FOREIGN KEY (`product`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- RETAILER_PRODUCT TABLE --
-- retailer - an int corresponding to an retailer (foreign key)
-- product - an int corresponding to a product (foreign key)

CREATE TABLE `retailer_product` (
  `retailer` int(15) NOT NULL,
  `product` int(15) NOT NULL,
  PRIMARY KEY (`retailer`, `product`),
  CONSTRAINT `fk_retailer` FOREIGN KEY (`retailer`) REFERENCES `retailer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_product` FOREIGN KEY (`product`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- PROMOTION_ECOUPON TABLE --
-- promotion - an int corresponding to an promotion (foreign key)
-- ecoupon - an int corresponding to a ecoupon (foreign key)

CREATE TABLE `promotion_ecoupon` (
  `promotion` int(15) NOT NULL,
  `ecoupon` int(15) NOT NULL,
  PRIMARY KEY (`promotion`, `ecoupon`),
  CONSTRAINT `fk_promotion` FOREIGN KEY (`promotion`) REFERENCES `promotion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ecoupon` FOREIGN KEY (`ecoupon`) REFERENCES `ecoupon` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- FAVORITES_RETAILER TABLE --
-- user - an int corresponding to a user (foreign key)
-- retailer - an int corresponding to a retailer (foreign key)

CREATE TABLE `favorites_retailer` (
  `user` int(15) NOT NULL,
  `retailer` int(15) NOT NULL,
  PRIMARY KEY (`user`, `retailer`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_retailer` FOREIGN KEY (`retailer`) REFERENCES `retailer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ************************************ INSERTIONS **************************************

-- USER TABLE INSERTIONS --
INSERT INTO user values (1, 'fridkisb', 'ESaveRules', 'fridkisb@oregonstate.edu', '1234 Lone Star,
					TX, 77042', NULL, 'Y', 'Y', 'Y');

-- Works Referenced
-- -- https://www.w3schools.com/sql/sql_datatypes.asp




