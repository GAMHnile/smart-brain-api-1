BEGIN TRANSACTION;

INSERT INTO users (name, email, entries, joined) VALUES ('Maya', 'a@a', 5, '2020-09-27');
INSERT INTO login (hash, email) VALUES ('$2a$10$WAK21U0LWl7C//jJ.DOB2uPP1DJQh7KUDgasdyQeGzkop2Pzl8W7u', 'a@a');

COMMIT;