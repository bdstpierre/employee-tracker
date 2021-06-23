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
};

// Function to allow the user to select a department
const getDepartments = () => {
    connection.query('SELECT id AS value, name FROM department ORDER BY name ASC;', (err, res) => {
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
    connection.query('SELECT DISTINCT employee.manager_id AS value, CONCAT(manager.first_name, " ", manager.last_name) AS name FROM employee LEFT JOIN employee AS manager ON employee.manager_id = manager.id where manager.id IS NOT NULL ORDER BY name ASC;', (err, res) => {
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
    connection.query('SELECT DISTINCT employee.manager_id AS value, CONCAT(manager.first_name, " ", manager.last_name) AS name FROM employee LEFT JOIN employee AS manager ON employee.manager_id = manager.id where manager.id IS NOT NULL ORDER BY name ASC;', (err, res) => {
        if (err) throw err;
        inquirer.prompt({
            name: 'action',
            type: 'list',
            message: "Select the new employee's manager:",
            choices: res
        })
        .then((answer) => {
            manager = answer;
            connection.query('SELECT role.id AS value, role.title AS name FROM role WHERE role.title IS NOT NULL ORDER BY name ASC;', (err, res) => {
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
    connection.query('SELECT employee.id AS value, CONCAT(employee.first_name, " ", employee.last_name) AS name FROM employee ORDER BY name ASC;', (err, res) => {
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
    connection.query('SELECT employee.id AS value, CONCAT(employee.first_name, " ", employee.last_name) AS name FROM employee ORDER BY name ASC;', (err, res) => {
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
                if (err) throw err;
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

// Function to update an employee manager
const updateEmployeeManager = () => {
    connection.query('SELECT employee.id AS value, CONCAT(employee.first_name, " ", employee.last_name) AS name FROM employee ORDER BY name ASC;', (err, res) => {
        if (err) throw err;
        inquirer.prompt({
            name: 'action',
            type: 'list',
            message: "Select the employee whose manager you wish to update:",
            choices: res
        })
        .then((answer) => {
            console.table(employeeList);
            const employeeId = answer.action;
            connection.query('SELECT id as value, CONCAT(first_name, " ", last_name) AS name FROM employee', (err, res) => {
                if (err) throw err;
                inquirer.prompt({
                    name: 'action',
                    type: 'list',
                    message: "Select the new manager for the employee:",
                    choices: res
                })
                .then((answer) => {
                    const managerId = answer.action;
                    connection.query('UPDATE employee SET manager_id = ? WHERE id = ?;', [managerId, employeeId], (err, res) => {
                        if (err) throw err;
                        console.log(`Employee with ID ${employeeId} now has manager with ID ${managerId}`);
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

// Function to list all the roles
const viewAllRoles = () => {
    connection.query('SELECT role.id AS id, role.title AS title, role.salary AS salary, department.name AS department FROM role LEFT JOIN department ON role.department_id = department.id ORDER BY department, title ASC;', (err, res) => {
        if (err) throw err;
        console.table(res);
        runCMS();
    });
};

// Function to add a role
const addRole = () => {
    connection.query('SELECT id AS value, name FROM department ORDER BY name;', (err, res) => {
        if (err) throw err;
        const departmentList = res;
        connection.query('SELECT role.id AS id, role.title AS title, role.salary AS salary, department.name AS department FROM role LEFT JOIN department ON role.department_id = department.id ORDER BY department, title ASC;', (err, res) => {
            if (err) throw err;
            console.table(res);
            inquirer.prompt([{
                name: 'title',
                type: 'input',
                message: "Current roles are listed above.\nWhat title would you like the new role to have?"
            },
            {
                name: 'salary',
                type: 'input',
                message: "What salary would you like the new role to have?"
            },        
            {
                name: 'department',
                type: 'list',
                message: "Select the department this new role is in:",
                choices: departmentList
            }])
            .then((answer) => {
                connection.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?);', [answer.title, answer.salary, answer.department], (err, res) => {
                    if (err) throw err;
                    viewAllRoles();
                });
            })
            .catch((err) => {
                if(err) throw err;
            });    
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
                updateEmployeeManager();
            break;
            case 'View All Roles':
                console.log(`You have selected to ${answer.action}`);
                viewAllRoles();
            break;
            case 'Add Role':
                console.log(`You have selected to ${answer.action}`);
                addRole();
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