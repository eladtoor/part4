const blogsRouter = require('express').Router();
const { request, response } = require('../app');
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs);
  });
});

blogsRouter.post('/', (request, response, next) => {
  const blog = new Blog(request.body);

  blog
    .save()
    .then((result) => {
      response.status(201).json(result);
    })
    .catch((error) => next(error));
});

blogsRouter.delete('/:id', async (request, response, next) => {
  const id = request.params.id;
  try {
    const deletedNote = await Blog.findByIdAndRemove(id);
    return response.json(deletedNote);
  } catch (error) {
    next(error);
  }
});

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
    next(error);
  }
});
module.exports = blogsRouter;
