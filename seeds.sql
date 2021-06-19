USE employee_cms;

INSERT INTO department (name)
VALUES ('IT'), ('Engineering'), ('Quality'), ('Shipping');

INSERT INTO role (title, salary, department_id)
VALUES
('IT Manager', 150000.00, 1),
('Engineering Manager', 150000.00, 2),
('Quality Manager', 150000.00, 3),
('Shipping Manager', 150000.00, 4),
('Senior Developer', 120000.00, 1),
('Senior Engineer', 120000.00, 2),
('Senior Quality Engineer', 120000.00, 3),
('Senior Shippping Associate', 120000.00, 4),
('Analyst', 110000.00, 1),
('Engineer', 110000.00, 2),
('Inspector', 80000.00, 3),
('Shipper', 80000.00, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Bob', 'Smith', 1, null),
('Susan', 'Serandon', 2, null),
('Larry', 'Jones', 3, null),
('Tina', 'Turner', 4, null),
('Frank', 'Chen', 1, 1),
('Betty', 'Crocker', 2, 2),
('Tom', 'Petty', 3, 3),
('Mary', 'Magdalene', 4, 4),
('Elizabeth', 'Shue', 1, 1),
('Tito', 'Fuentes', 2, 2),
('Perry', 'Katy', 3, 3),
('David', 'Gilmour', 4, 4);



