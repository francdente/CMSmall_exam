BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"email"	TEXT,
	"name"	TEXT,
	"admin"  BOOLEAN,
	"salt"	TEXT,
	"password"	TEXT
);
CREATE TABLE IF NOT EXISTS "pages" (
	"page_id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"author_id"	INTEGER,
	"title"	TEXT,
	"creation_date"	DATE,
	"publication_date"	DATE
);
CREATE TABLE IF NOT EXISTS "blocks" (
	"block_id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"page_id"	INTEGER,
	"block_type"	TEXT,
	"content"	TEXT,
	"position"	INTEGER
);
CREATE TABLE IF NOT EXISTS "sites" (
	"site_id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"site_name"	TEXT
);

CREATE TABLE IF NOT EXISTS "images" (
	"image_id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"image_name"	TEXT,
	"image_path"	TEXT
);



INSERT into "users" (email, name, admin, salt, password) VALUES ("u1@e.com", "u1", false, "qwerkglfmdhcntps", "78da2797f6076a25bb0235ab0d1b18c40758d72ea58850f9ed8621a8d411f064");
INSERT into "users" (email, name, admin, salt, password) VALUES ("u2@e.com", "u2", false, "dkcmflgjdksenfpr", "dface7ad6a504a6bb5d00e305d1261570c68f50f2c29d371f054fa459490a8cf");
INSERT into "users" (email, name, admin, salt, password) VALUES ("u3@e.com", "u3", false, "qwerjgkldfjgkldf", "90704caec9f967f745fac156c161663ff585e2600162b762360cbf50ced3f83d");
INSERT into "users" (email, name, admin, salt, password) VALUES ("a1@e.com", "a1", true, "fwerjgkldajskldf", "e9f5590a4f6e140652a6310cec6918e29554e3ce78984fabd20b29073a302650");

INSERT into "pages" (author_id, title, creation_date, publication_date) VALUES (1, "Page 1", "2019-01-01", "2019-01-01");
INSERT into "pages" (author_id, title, creation_date, publication_date) VALUES (1, "Page 2", "2019-01-02", "2019-01-02");
INSERT into "pages" (author_id, title, creation_date, publication_date) VALUES (1, "Page 3", "2019-01-03", "2030-01-03");
INSERT into "pages" (author_id, title, creation_date, publication_date) VALUES (2, "Page 4", "2019-01-04", "2019-01-04");
INSERT into "pages" (author_id, title, creation_date, publication_date) VALUES (2, "Page 5", "2019-01-07", null);

INSERT into "blocks" (page_id, block_type, content, position) VALUES (1, "header", "Lorem ipsum dolor sit amet", 0);
INSERT into "blocks" (page_id, block_type, content, position) VALUES (1, "paragraph", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, vitae aliquam", 1);
INSERT into "blocks" (page_id, block_type, content, position) VALUES (1, "image","http://localhost:3001/static/images/test.jpg", 2);

INSERT into "sites" (site_name) VALUES ("CMSmall");

INSERT into "images" (image_name, image_path) VALUES ("sunset1", "http://localhost:3001/static/images/sunset1.jpg");
INSERT into "images" (image_name, image_path) VALUES ("sunset2", "http://localhost:3001/static/images/sunset2.jpg");
INSERT into "images" (image_name, image_path) VALUES ("pokemon", "http://localhost:3001/static/images/pokemon.jpg");
INSERT into "images" (image_name, image_path) VALUES ("robot", "http://localhost:3001/static/images/robot.jpg");