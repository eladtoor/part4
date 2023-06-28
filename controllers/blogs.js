const blogsRouter = require('express').Router();
const { request, response } = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const middleware = require('../utils/middleware');
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
    id: 1,
  });

  response.json(blogs);
});

blogsRouter.post(
  '/',
  middleware.userExtractor,
  async (request, response, next) => {
    const body = request.body;

    try {
      const user = request.user;
      console.log(user);
      const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user.id,
      });

      const savedBlog = await blog.save();

      user.blogs = user.blogs.concat(savedBlog._id);
      await user.save();
      response.json(savedBlog);
    } catch (error) {
      next(error);
    }
  }
);

blogsRouter.delete(
  '/:id',
  middleware.userExtractor,
  async (request, response, next) => {
    const id = request.params.id;
    const blog = await Blog.findById(id);
    if (request.user.id === blog.user.toString()) {
      try {
        const deletedBlog = await Blog.findByIdAndRemove(id);
        return response.json(deletedBlog);
      } catch (error) {
        next(error);
      }
    }
    return response.status(401).json({ error: 'user invalid' });
  }
);

blogsRouter.put('/:id', async (request, response, next) => {
  const id = request.params.id;
  const body = request.body;
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { likes: body.likes },
      { new: true }
    );
    return response.json(updatedBlog);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = blogsRouter;
