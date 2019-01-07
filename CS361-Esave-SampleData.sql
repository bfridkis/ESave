
-- ***************************** SAMPLE DATA/INSERTIONS CONT. **********************************

-- PRODUCT INSERTIONS --

INSERT INTO product values (21, 'Playstation 4', '785947295512', NULL),
				(31, 'Echo Dot', '738902715693', NULL),
				(41, 'Ink Pens', '783027454531', NULL),
				(51, 'Pajamas', '712457809012', NULL),
				(61, 'Bose Headphones', '785409257212', NULL),
				(71, 'Friskies Adult Cat food', '771122334492', NULL);
-- RETAILER INSERTIONS --

INSERT INTO retailer values (51, 'Wal-mart', 'walmart.com', NULL, 2.99);

-- PROMOTIONS INSERTIONS --
INSERT INTO promotion values (21, 25, 21, '$25 OFF coupon celebrating the PS4s 9th Birthday', 'ps40x9', NULL, 21, 1, NULL),
				(31, 3.99, 31, 'Ink Pens BOGO while supplies last', 'nk39x9', NULL, 41, 3, NULL);

-- RETAILER PRODUCT INSERTIONS --

INSERT INTO retailer_product values (21, 21, 299.99, 'The most advanced playstation system ever. Designed to take your favorite PS4 games and add to them power for graphics, performance, and other features. Ready to Level Up?', '2018-09-22 5:49:11'),
					(31, 21, 290.99, 'The newest Playstation on the market. Designed to play currently trending PS4 games and blu-ray Movies. Game On!', '2018-09-22 5:15:54'),
					(31, 41, 3.99, 'Whether it is back to school or back to work, these Ink Pens are guaranteed  to last.', '2018-09-22 5:11:59'),
					(41, 51, 29.99, 'These Fleece pajamas will guarantee your warmth and comfort throughout the Fall and Winter. With many different designs and colors there are pajamas for the whole family.', '2018-09-22 4:32:12'),
					(51, 31, 99.99, 'A smaller more compact Amazon Echo, for those on a budget. Invite Alexa into your home, have her give you daily reminders or tell you a joke. The amazon Echo can play music from any streaming music application!', '2018-09-22 3:20:12'),
					(21, 61, 139.99, 'Surround sound in a pair of wireless Bose Headphones. These state of the art Headphones deliver clear and crisp audio, whether they are connected to your TV, MP3 Player, or Computer.', '2018-09-22 5:43:34'),
					(31, 71, 26.99, 'Adult cat food frome Friskies. Contains all the nutrients your adult cat needs for staying healthy. Made from Fish, Grains, and root vegetables.', '2018-09-22 6:43:12');
