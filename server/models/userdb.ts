import { Database } from "bun:sqlite";

export interface User {
    id?: number;
    email: string;
    passwd: string
}

export class UsersDatabase {
    db: Database;

    constructor() {
        this.db = new Database('Users.db');
        this.init()
            .then(() => console.log('Database initialized'))
            .catch(console.error);
    }

    async getUsers() {
        return this.db.query('SELECT * FROM Users').all();
    }

    async getUsersEmail(email: string) {
        return this.db.query(`SELECT * FROM Users WHERE email = '${email}' `).all();
    }

    async addUser(User: User) {
        return this.db.query(`INSERT INTO Users (email, passwd) VALUES (?, ?) RETURNING id`).get(User.email, User.passwd) as User;
    }
    
    async deleteUser(id: number) {
        return this.db.run(`DELETE FROM Users WHERE id = ${id}`)
    }

    async init() {
        return this.db.run('CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, passwd TEXt)');
    }
}
