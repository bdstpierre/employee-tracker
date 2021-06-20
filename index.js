const dotenv = require('dotenv');
dotenv.config();

const inquirer = require('inquirer');
const mysql = require('mysql');
const cTable = require('console.table');

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
        'View All EMployees by Department',
        'View All Employees by Manager',
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

const runCMS = () => {
    inquirer.prompt(mainMenuPrompt)
    .then((answer) => {
        switch (answer.action) {
            case 'View All Employees':
                console.log(`You have selected to ${answer.action}`);
                runCMS();
            break;
            case 'View All EMployees by Department':
                console.log(`You have selected to ${answer.action}`);
                runCMS();
            break;
            case 'View All Employees by Manager':
                console.log(`You have selected to ${answer.action}`);
                runCMS();
            break;
            case 'Add Employee':
                console.log(`You have selected to ${answer.action}`);
                runCMS();
            break;
            case 'Remove Employee':
                console.log(`You have selected to ${answer.action}`);
                runCMS();
            break;
            case 'Update Employee Role':
                console.log(`You have selected to ${answer.action}`);
                runCMS();
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
    })
};