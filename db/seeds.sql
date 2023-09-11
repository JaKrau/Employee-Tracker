INSERT INTO departments (departments.department_name)
VALUES
("Supreme Manager"),
("Sales"),
("Design"),
("Marketing"),
("Production"),
("HR");

INSERT INTO roles (roles.title, roles.salary, roles.department_id)
VALUES
('Manager Supreme', 1000000, 1),
('Head of Sales', 74000, 2),
('Design Lead', 75000, 3),
('Head of Marketing', 75000, 4),
('Head of Production', 75000, 5),
('HR Person', 45000, 6);

INSERT INTO employees (employees.first_name, employees.last_name, employees.role_id, employees.manager_id)
VALUES
("Beff", "Jezos", 1, NULL),
("Steve", "Harvey", 2, 1),
("Tike", "Myson", 3, 1),
("Forge", "Goreman", 4, 1),
("Dob", "Bole", 5, 1),
("Serena", "Williams", 6, 1);
