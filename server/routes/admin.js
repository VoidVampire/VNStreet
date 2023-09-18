const express = require('express')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { PostsDatabase } = require('../models/postdb');
const { UsersDatabase } = require('../models/userdb');
const { User } = require('../models/userdb');
const router = express.Router();
const methodOverride = require('method-override');
const jwtSecret = process.env.JWT_SECRET;

router.use(cookieParser());
router.use(methodOverride('_method'));
router.use(express.urlencoded({ extended: true }));

const postsDB = new PostsDatabase();
const usersDB = new UsersDatabase();

const authMiddleWare = (req, res, next) => {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message: "UNAUTHORIZED"})
    }
    try{
        const dcoded = jwt.verify(token, jwtSecret);
        req.userId = dcoded.userId;
        next();
    } catch (error){
        return res.status(401).json({message: "UNAUTHORIZED"})
    }
}

// GET Admin - Login Page
router.get("/admin", async (req, res) => {
    try {
        const local = {
            title: "Admin | VNStreet",
        }
        res.render('admin', { local }); 

    } catch (error) {
        console.log(error);
    }
});


//POST Admin - Check Login
router.post("/admin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await usersDB.getUsersEmail(email);

        if (!user){
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isPasswordV = await Bun.password.verify(password, user[0].passwd);
        if (!isPasswordV){
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.email}, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

//POST Admin - Dashboard
router.get("/dashboard", authMiddleWare, async (req, res) => {
    const local = {
        title: "Dashboard | VNStreet",
    }
    const data = await postsDB.getPosts();
    res.render('dashboard', { local, data });
});

//GET Admin - Add Post
router.get("/add-post", authMiddleWare, async (req, res) => {
    const local = {
        title: "Add Post | VNStreet",
    }
    res.render('add-post', { local });
});

//POST Admin - Add Post
router.post("/add-post", authMiddleWare, async (req, res) => {
    
    const newPge = {
        title: req.body.title,
        body: req.body.body,
        tags: req.body.tags,
        banner: req.body.banner,
        url: req.body.title.replace(/\s+/g, '-').toLowerCase(),
        createdAt: new Date(),
        updatedAt: new Date()
    };
    postsDB.addPost(newPge);
    res.redirect('/dashboard');
});

//GET Admin - Edit Post
router.get("/edit-post/:id", authMiddleWare, async (req, res) => {
    
    const local = {
        title: "Edit Post | VNStreet",
    }
    const url = req.params.id;
    const data = await postsDB.getPostURL(url);
    res.render('edit-post', { local, data });
    
});

//PUT Admin - Edit Post
router.put("/edit-post/:id", async (req, res) => {
    try{
        const updatedPost = {
            id: req.body.id,
            title: req.body.title,
            body: req.body.body,
            tags: req.body.tags,
            banner: req.body.banner,
            url: req.body.title.replace(/\s+/g, '-').toLowerCase(),
            createdAt: req.body.createdAt,
            updatedAt: new Date()
        };
        postsDB.updatePost(req.body.id, updatedPost);
        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
      }
});

//DELETE Admin - Delete Post
router.delete("/delete-post/:id", authMiddleWare, async (req, res) => {
    try{
        const idd = req.params.id;
        postsDB.deletePost(idd);
        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
    }
});

//GET Admin - Sign out
router.get("/signout", async (req, res) => {
    res.clearCookie('token');
    res.redirect('/')
});

// POST Admin - Register
router.post("/register", async (req, res) => {
    try {
    const { email, password } = req.body;
        console.log(req.body);
        const hashedPassword = await Bun.password.hash(password, {
            algorithm: "bcrypt",
            cost: 6, 
        });
        
        const user = {
            email: email,
            passwd: hashedPassword
        };
        usersDB.addUser(user);
        console.log("User created");
        res.redirect("/admin");
    } catch (error) {
        console.log(error);
    }
});

module.exports = router