const express = require('express');
const router = express.Router();
const { PostsDatabase } = require('../models/postdb');
const { marked } = require('marked');

const Renderer = marked.Renderer;
const postsDB = new PostsDatabase();
const renderer = new Renderer();

renderer.heading = function (text, level) {
    let headingClass = '';
    switch (level) {
      case 1:
        headingClass = 'text-4xl font-extrabold';
        break;
      case 2:
        headingClass = 'text-3xl font-extrabold';
        break;
      case 3:
        headingClass = 'text-2xl font-extrabold';
        break;
      default:
        headingClass = 'text-md';
    }
    return `<h${level} class="${headingClass}">${text}</h${level}>`;
};

renderer.image = function (href, title, text) {
    return `
      <div class="flex justify-center items-center max-h-96">
        <img src="${href}" alt="${text}" title="${title}" class="max-w-full max-h-96" height=300 width=500>
      </div>
    `;
};

// GET HomePage
router.get("/", async (req, res) => {
    try {
        const local = {
            title: "VNStreet",
        }
        let perPage = 3;
        let page = req.query.page || 1;

        const data = await postsDB.getPostsInfo(page, perPage);

        const count = await postsDB.getPostCount();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count[0]['COUNT(*)'] / perPage);
        const hasNewerPage = parseInt(page) > 1;

        res.render('index', {
            local, 
            data, 
            current: page, 
            nextPage: hasNextPage ? nextPage : null, 
            previousPage: hasNewerPage ? parseInt(page) - 1 : null,
            currentRoute: '/'
        });
    } catch (error) {
        console.log(error);
    }
});



// GET / Post:id
router.get("/blog/:id", async (req, res) => {
    try {
        const local = {
            title: "VNStreet",
        }
        const url = req.params.id;
        const data = await postsDB.getPostURL(url);

        const htmll = marked(data[0].body, { renderer });
        const mhtml = {
            mbody: htmll
        };
        res.render('post', { local, data , mhtml});

    } catch (error) {
        console.log(error);
    }
});

// GET / About
router.get('/about', (req, res) => {
    const local = {
        title: "About | VNStreet",
    };
    res.render('about', { local });
});

// GET / Blog
router.get('/blog', async (req, res) => {
    try {
        const local = {
            title: "Blogs | VNStreet",
        }
        const data = await postsDB.getPosts();
        res.render('blog', { local, data });
    } catch (error) {
        console.log(error);
    }
});

// GET / Tags
router.get('/tags', (req, res) => {
    const local = {
        title: "Tags | VNStreet",
    };
    res.render('tags', { local });
});


module.exports = router