-- Create the application user
CREATE USER petlink_user WITH PASSWORD 'petlink_pass';

-- Create the database owned by the application user
CREATE DATABASE petlink OWNER petlink_user;

-- Grant privileges (though ownership implies full control)
GRANT ALL PRIVILEGES ON DATABASE petlink TO petlink_user;

-- Ensure the user can connect
GRANT CONNECT ON DATABASE petlink TO petlink_user;

-- Grant default privileges in the public schema to the app user, on future tables not created by itself
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO petlink_user;
