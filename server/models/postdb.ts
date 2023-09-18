import { Database } from "bun:sqlite";

export interface Post {
    id?: number;
    title: string;
    body: string;
    tags: string;
    url: string;
    banner: string,
    createdAt: Date;
    updatedAt: Date;
}

export class PostsDatabase {
    db: Database;

    constructor() {
        this.db = new Database('Posts.db');
        this.init()
            .then(() => console.log('Database initialized'))
            .catch(console.error);
    }

    async getPosts() {
        return this.db.query('SELECT * FROM Posts').all();
    }

    async getPostURL(url: string) {
        return this.db.query(`SELECT * FROM Posts WHERE url = '${url}' `).all();
    }

    async addPost(Post: Post) {
        return this.db.query(`INSERT INTO Posts (title, body, tags, url, banner, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`).get(Post.title, Post.body, Post.tags, Post.url, Post.banner, Post.createdAt.toDateString(), Post.updatedAt.toDateString()) as Post;
    }
    
    async updatePost(id: number, Post: Post) {
        return this.db.query(`UPDATE Posts SET title = ?, tags = ?, body = ?, url = ?, banner = ?, createdAt = ?, updatedAt = ? WHERE id = ${id}`).get(Post.title, Post.tags, Post.body, Post.url, Post.banner, Post.createdAt.toString(), Post.updatedAt.toDateString());
    }

    async updatePostss(id: number, banner: string) {
        return this.db.query(`UPDATE Posts SET banner = ? WHERE id = ${id}`).get(banner);
    }

    async findID(url: string) {
        return this.db.query(`SELECT id from Posts WHERE url=${url}`);
    }

    async deletePost(id: number) {
        return this.db.run(`DELETE FROM Posts WHERE id = ${id}`)
    }

    async getPostsInfo(page: number, perPage: number) {
        const offset = (page - 1) * perPage;
        return this.db.query(`SELECT * FROM Posts ORDER BY id DESC LIMIT ${perPage} OFFSET ${offset}`).all();
    }
    
    async getPostCount() {
        return this.db.query('SELECT COUNT(*) FROM Posts').all();
    }
    
    
    async init() {
        return this.db.run('CREATE TABLE IF NOT EXISTS Posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT, tags TEXT, url TEXT, banner TEXT, createdAt DATE, updatedAt DATE)');
    }
}
