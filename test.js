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
    console.log(departmentList());
    
});


const departmentList = () => {connection.query('SELECT name AS department FROM department ORDER BY department ASC;', (err, res) => {
    if (err) throw err;
    let dList = [];
    for (let i=0; i < res.length; i++){
        dList[i] = res[i].department;
    }
    // console.log(`\nThis is the departmentList: ${dList}`);
    // console.log(`\nThis is the manual departmentList: ${['A','B','C','D']}\n`);
    // console.log(typeof dList);
    // console.log(dList);
    return dList;
});
connection.end();

};