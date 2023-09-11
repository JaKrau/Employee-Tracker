require('dotenv').config();
const inquirer = require('inquirer');
const sql = require('mysql2');
const express = require('express');


// connects to the database with credentials from .env
const db = sql.createConnection (
    {
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    console.log(`connected to ${process.env.DB_NAME}` )
);

// starts the server
const app = express();

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

db.connect(error => {
    if (error) throw error;
    start();
});

function start() {
    inquirer.prompt({
        type: 'list',
        name: 'item',
        message: 'Select one of the options below.',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update employee role'
        ]
    }).then(answer => {
        switch (answer.item) {
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update employee role':
                updateRole();
                break;
        }
    });
}

function viewDepartments() {
    const sqlQuery = `SELECT * FROM departments`;
    db.query(sqlQuery, (error, rows) => {
        if (error) throw error;
        console.table(rows);
        start();
    });
}

function viewRoles() {
    const sqlQuery =`SELECT * FROM roles`;
    db.query(sqlQuery, (error, rows) => {
        if (error) throw error;
        console.table(rows);
        start();
    });
}

function viewEmployees() {
    const sqlQuery = `SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.department_name AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employees
    LEFT JOIN roles ON employees.role_id = roles.id
    LEFT JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees manager ON manager.id = employees.manager_id`;
    db.query(sqlQuery, (error, rows) => {
        if (error) throw error;
        console.table(rows);
        start();
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of this department?'
        }
    ]).then(answer => {
        const sqlQuery = `INSERT INTO departments (department_name)
        VALUES (?)`;
        const params = [answer.name];
        db.query(sqlQuery, params, (error, result) => {
            if (error) throw error;
            console.log('Department added');
            start();
        });
    });
}

function addRole() {
    db.query(`SELECT id, department_name FROM departments`, (error, departments) => {
        if (error) throw error;
        const departmentMap = departments.map(({ id, department_name }) => ({
            name: department_name,
            value: id,
        }));
        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What is the title for this role?'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary for this role?'
            },
            {
                type: 'list',
                choices: departmentMap,
                name: 'department_id',
                message: 'Which department does this role belong to?'
            }
        ]).then(answer => {
            const sqlQuery = `INSERT INTO roles (title, salary, department_id)
            VALUES (?, ?, ?)`;
            const params = [answer.title, answer.salary, answer.department_id];
            db.query(sqlQuery, params, (error, result) => {
                if (error) throw error;
                console.log('Role added');
                start();
            });
        });
    });
}

function addEmployee() {
    db.query(`SELECT id, title FROM roles`, (error, roles) => {
        if (error) throw error;
        const roleMap = roles.map(({ id, title }) => ({
            name: title,
            value: id,
        }));
        db.query(`SELECT id, first_name, last_name FROM employees`, (error, employees) => {
            if (error) throw error;
            const employeeMap = employees.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id,
            }));
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: `What is the employee's first name?`
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: "What is the employee's last name?"
                },
                {
                    type: 'list',
                    choices: roleMap,
                    name: 'role_id',
                    message: "What is the employee's role?"
                },
                {
                    type: 'list',
                    choices: employeeMap,
                    name: 'manager_id',
                    message: "Who is the employee's manager?"
                }
            ]).then(answer => {
                const sqlQuery = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
                VALUES (?, ?, ?, ?)`;
                const params = [answer.first_name, answer.last_name, answer.role_id, answer.manager_id];
                db.query(sqlQuery, params, (error, result) => {
                    if (error) throw error;
                    console.log('Employee added');
                    start();
                });
            });
        });
    });
}

function updateRole () {
    db.query(`SELECT id, title FROM roles`, (error, roles) => {
        if (error) throw error;
    
        const roleMap = roles.map(({ id, title }) => ({
            name: title, 
            value: id,
        }));
        db.query(`SELECT id, first_name, last_name FROM employees`, (error, employees) => {
            if (error) throw error;

            const employeeMap = employees.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`, 
                value: id,
            }));
            inquirer.prompt([
                {
                    type: 'list',
                    choices: employeeMap,
                    name: 'employee_id',
                    message: "Who is the employee?"
                },
                {
                    type: 'list',
                    choices: roleMap,
                    name: 'role_id',
                    message: "What is the employee's new role?"
                }
            ])
            .then(answer => {
                const sqlQuery = `UPDATE employees
                SET role_id = ?
                WHERE id = ?`;
                const params = [answer.role_id, answer.employee_id];
            db.query(sqlQuery, params, (error, result) => {
                if (error) throw error;
                console.log('Employee role updated.');
                start();
                });
            });
        });
    });
}