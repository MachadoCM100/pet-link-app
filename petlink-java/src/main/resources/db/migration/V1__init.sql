CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   username VARCHAR(50) NOT NULL UNIQUE,
   email VARCHAR(255) NOT NULL UNIQUE,
   password VARCHAR(255) NOT NULL
);

CREATE TABLE roles (
   id SERIAL PRIMARY KEY,
   name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE user_roles (
   user_id INT NOT NULL,
   role_id INT NOT NULL,
   PRIMARY KEY (user_id, role_id),
   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
   FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE pets (
   id SERIAL PRIMARY KEY,
   name VARCHAR(50) NOT NULL,
   type VARCHAR(30) NOT NULL,
   age INT NOT NULL,
   description VARCHAR(255),
   adopted BOOLEAN NOT NULL,
   created_at VARCHAR(30) NOT NULL
);

INSERT INTO roles (name) VALUES ('USER'), ('ADMIN');
INSERT INTO users (username, email, password) VALUES ('user1', 'user@gmail.com', 'password1');
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);
INSERT INTO pets (name, type, age, description, adopted, created_at) VALUES
  ('Buddy', 'Dog', 5, 'Friendly golden retriever', false, '2026-01-01'),
  ('Mittens', 'Cat', 3, 'Playful tabby cat', true, '2026-01-15');
