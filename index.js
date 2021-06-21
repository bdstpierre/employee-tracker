const dotenv = require('dotenv');
dotenv.config();

const inquirer = require('inquirer');
const mysql = require('mysql');
const console = require('console');
//const cTable = require('console.table');

const PORT = process.env.PORT || 3306;

// Connect to the mysql database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'employee_cms'
});

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    runCMS();
});

// Setup manin menu prompt
const mainMenuPrompt = {
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
        'View All Employees',
        'View All Employees in a Department',
        'View All Employees under a Manager',
        'Add Employee',
        'Remove Employee',
        'Update Employee Role',
        'Update Employee Manager',
        'View All Roles',
        'Add Role',
        'Remove Role',
        'View All Departments',
        'Add Department',
        'Remove Department',
        'View Salary Budgets by Department',
        'exit'
    ]
};

// Function to return all employees and their details
const viewAllEmployees = () => {
    connection.query('SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, role.title AS title, department.name AS department, role.salary AS salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN employee AS manager ON employee.manager_id = manager.id LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id;', (err, res) => {
        if (err) throw err;
        console.table(res);
        runCMS();
    });
}

// Function to allow the user to select a department
const getDepartments = () => {
    const departmentList = connection.query('SELECT id AS value, name FROM department ORDER BY name ASC;', (err, res) => {
        if (err) throw err;
        inquirer.prompt({
            name: 'action',
            type: 'list',
            message: 'From which department do you want to see employees?',
            choices: res
        })
        .then((answer) => {
            viewAllEmployeesByDepartment(answer.action);
        })
        .catch((err) => {
            if (err) throw err;
        });    
    });
};

// Function to return all employees in a department
const viewAllEmployeesByDepartment = (action) => {
    connection.query('SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, role.title AS title, department.name AS department, role.salary AS salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN employee AS manager ON employee.manager_id = manager.id LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department.id = ?;', action, (err, res) => {
        if (err) throw err;
        console.table(res);
        runCMS();
    });
};

// Function to allow the user to select a manager name
const getManagers = () => {
    const managerList = connection.query('SELECT DISTINCT employee.manager_id AS value, CONCAT(manager.first_name, " ", manager.last_name) AS name FROM employee LEFT JOIN employee AS manager ON employee.manager_id = manager.id where manager.id IS NOT NULL ORDER BY name ASC;', (err, res) => {
        if (err) throw err;
        inquirer.prompt({
            name: 'action',
            type: 'list',
            message: 'From which manager do you want to see employees?',
            choices: res
        })
        .then((answer) => {
             viewAllEmployeesByManager(answer.action);
        })
        .catch((err) => {
            if (err) throw err;
        });    
    });
};

// Function to return all employees reporting to a manager
const viewAllEmployeesByManager = (action) => {
    connection.query('SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, role.title AS title, department.name AS department, role.salary AS salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN employee AS manager ON employee.manager_id = manager.id LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE employee.manager_id = ?;', action, (err, res) => {
        if (err) throw err;
        console.table(res);
        runCMS();
    });
};

// Function to add an employee to the database
const addEmployee = () => {
    let manager = '';
    let role = '';
    const managerList = connection.query('SELECT DISTINCT employee.manager_id AS value, CONCAT(manager.first_name, " ", manager.last_name) AS name FROM employee LEFT JOIN employee AS manager ON employee.manager_id = manager.id where manager.id IS NOT NULL ORDER BY name ASC;', (err, res) => {
        if (err) throw err;
        inquirer.prompt({
            name: 'action',
            type: 'list',
            message: "Select the new employee's manager:",
            choices: res
        })
        .then((answer) => {
            manager = answer;
            const roleList = connection.query('SELECT role.id AS value, role.title AS name FROM role WHERE role.title IS NOT NULL ORDER BY name ASC;', (err, res) => {
                if (err) throw err;
                inquirer.prompt({
                    name: 'action',
                    type: 'list',
                    message: "Select the new employee's role:",
                    choices: res
                })
                .then((answer) => {
                    role = answer;
                    inquirer.prompt([
                        {
                            name: 'first_name',
                            type: 'input',
                            message: "Please enter the new employee's first name:"
                        },
                        {
                            name: 'last_name',
                            type: 'input',
                            message: "Please enter the new employee's last name:"
                        }                
                    ])
                    .then((answer) => {
                        connection.query(`INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ("${answer.first_name}", "${answer.last_name}", ${role.action}, ${manager.action});`, (err, res) => {
                            if (err) throw err;
                            console.log( `Employee ${answer.first_name} ${answer.last_name} added to the database`);
                            viewAllEmployees();
                        });
                    })
                    .catch((err) => {
                        if (err) throw err;
                    });
                })
                .catch((err) => {
                    if (err) throw err;
                });    
            });
        })
        .catch((err) => {
            if (err) throw err;
        });
    });
};

// Function to remove an employee
const removeEmployee = () => {
    const employeeList = connection.query('SELECT employee.id AS value, CONCAT(employee.first_name, " ", employee.last_name) AS name FROM employee ORDER BY name ASC;', (err, res) => {
        if (err) throw err;
        inquirer.prompt({
            name: 'action',
            type: 'list',
            message: "Select the employee you wish to remove:",
            choices: res
        })
        .then((answer) => {
            connection.query('DELETE FROM employee WHERE id = ?;', answer.action, (err, res) => {
                if (err) throw err;
                console.log(`Employee with ID ${answer.action} has been removed`);
                viewAllEmployees();
            })
        })
        .catch((err) => {
            if (err) throw err;
        });
    });
};

// Function to update an employee role
const updateEmployeeRole = () => {
    const employeeList = connection.query('SELECT employee.id AS value, CONCAT(employee.first_name, " ", employee.last_name) AS name FROM employee ORDER BY name ASC;', (err, res) => {
        if (err) throw err;
        inquirer.prompt({
            name: 'action',
            type: 'list',
            message: "Select the employee whose role you wish to update:",
            choices: res
        })
        .then((answer) => {
            const employeeId = answer.action;
            connection.query('SELECT id as value, title AS name FROM role', (err, res) => {
                inquirer.prompt({
                    name: 'action',
                    type: 'list',
                    message: "Select the new role for the employee:",
                    choices: res
                })
                .then((answer) => {
                    const roleId = answer.action;
                    connection.query('UPDATE employee SET role_id = ? WHERE id = ?;', [roleId, employeeId], (err, res) => {
                        if (err) throw err;
                        console.log(`Employee with ID ${employeeId} now has the role ${roleId}`);
                        viewAllEmployees();
                    });
                })
                .catch((err) => {
                    if (err) throw err;
                });       
            })
        })
        .catch((err) => {
            if (err) throw err;
        });
    });
};

const runCMS = () => {
    inquirer.prompt(mainMenuPrompt)
    .then((answer) => {
        switch (answer.action) {
            case 'View All Employees':
                console.log(`You have selected to ${answer.action}`);
                viewAllEmployees();
            break;
            case 'View All Employees in a Department':
                console.log(`You have selected to ${answer.action}`);
                getDepartments();
            break;
            case 'View All Employees under a Manager':
                console.log(`You have selected to ${answer.action}`);
                getManagers();
            break;
            case 'Add Employee':
                console.log(`You have selected to ${answer.action}`);
                addEmployee();
            break;
            case 'Remove Employee':
                console.log(`You have selected to ${answer.action}`);
                removeEmployee();
            break;
            case 'Update Employee Role':
                console.log(`You have selected to ${answer.action}`);
                updateEmployeeRole();
            break;
            case 'Update Employee Manager':
                console.log(`You have selected to ${answer.action}`);
                runCMS();
            break;
            case 'View All Roles':
                console.log(`You have selected to ${answer.action}`);
                runCMS();
            break;
            case 'Add Role':
                console.log(`You have selected to ${answer.action}`);
                runCMS();
            break;
            case 'Remove Role':
                console.log(`You have selected to ${answer.action}`);
                runCMS();
            break;
            case 'View All Departments':
                console.log(`You have selected to ${answer.action}`);
                runCMS();
            break;
            case 'Add Department':
                console.log(`You have selected to ${answer.action}`);
                runCMS();
            break;
            case 'Remove Department':
                console.log(`You have selected to ${answer.action}`);
                runCMS();
            break;
            case 'View Salary Budgets by Department':
                console.log(`You have selected to ${answer.action}`);
                runCMS();
            break;
            default:
                console.log(`You have selected to ${answer.action}`);
                connection.end();
                break;
            }
    })
    .catch((err) => {
        if (err) throw err;
    });
};