BEGIN TRANSACTION;

CREATE TABLE users(
    id serial PRIMARY KEY,
    name varchar(100) not null,
    email text unique not null,
    entries bigint DEFAULT 0,
    joined TIMESTAMP not null,
    age int,
    pet VARCHAR(20)
);

COMMIT;