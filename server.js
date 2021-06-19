const dotenv = require('dotenv');
dotenv.config();
const inquirer = require('inquirer');
const mysql = require('mysql');

const PORT = process.env.PORT || 3306;

console.log(`Host = ${process.env.DB_HOST}`);
console.log(`username = ${process.env.DB_USER}`);