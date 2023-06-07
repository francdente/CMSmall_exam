BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"email"	TEXT,
	"name"	TEXT,
	"role"  TEXT,
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


INSERT into "users" (email, name, role, salt, password) VALUES ("u1@e.com", "u1", "user", "qwerkglfmdhcntps", "78da2797f6076a25bb0235ab0d1b18c40758d72ea58850f9ed8621a8d411f064");
INSERT into "users" (email, name, role, salt, password) VALUES ("u2@e.com", "u2", "user", "dkcmflgjdksenfpr", "dface7ad6a504a6bb5d00e305d1261570c68f50f2c29d371f054fa459490a8cf");
INSERT into "users" (email, name, role, salt, password) VALUES ("u3@e.com", "u3", "user", "qwerjgkldfjgkldf", "90704caec9f967f745fac156c161663ff585e2600162b762360cbf50ced3f83d");
INSERT into "users" (email, name, role, salt, password) VALUES ("a1@e.com", "a1", "admin", "fwerjgkldajskldf", "e9f5590a4f6e140652a6310cec6918e29554e3ce78984fabd20b29073a302650");