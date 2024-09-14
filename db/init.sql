CREATE DATABASE IF NOT EXISTS juadah;
USE juadah;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  refresh_token VARCHAR(1000),

  UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS products (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price float NOT NULL,
  image VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS ratings (
  id_user INT NOT NULL,
  id_product INT NOT NULL,
  star TINYINT(1) NOT NULL,
  message VARCHAR(500) NOT NULL,

  PRIMARY KEY(id_user, id_product),
  FOREIGN KEY(id_user) REFERENCES users(id),
  FOREIGN KEY(id_product) REFERENCES products(id)
);
