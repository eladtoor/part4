const mongoose = require('mongoose');

const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');

const initialBlogs = [
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 15,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 10,
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[2]);
  await blogObject.save();
});

test('blog list application returns the correct amount of blog posts', async () => {
  const response = await api.get('/api/blogs');
  expect(response.body).toHaveLength(initialBlogs.length);
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('blog unique identifier is named id', async () => {
  const response = await api.get('/api/blogs');
  const firstBlog = response.body[0];
  expect(firstBlog.id).toBeDefined();
});

test('post request increase total number of blogs by one', async () => {
  const newBlog = {
    title: 'New Blog',
    author: 'Elad Toorgeman',
    url: 'www.blabla.com',
    likes: 5,
  };

  await api.post('/api/blogs').send(newBlog);

  const blogsInDb = await Blog.find({});
  blogsTitles = blogsInDb.map((blog) => blog.title);
  expect(blogsInDb).toHaveLength(initialBlogs.length + 1);
  expect(blogsTitles).toContain(newBlog.title);
});

test('likes default value is set to 0', async () => {
  const newBlog = {
    title: 'New Blog',
    author: 'Elad Toorgeman',
    url: 'www.blabla.com',
  };
  const response = await api.post('/api/blogs').send(newBlog);
  expect(response.body.likes).toBe(0);
});

test('title or url properties are required', async () => {
  const newBlogWithoutTitle = {
    author: 'Elad Toorgeman',
    url: 'www.blabla.com',
  };
  await api.post('/api/blogs').send(newBlogWithoutTitle);
  const newBlogWithoutUrl = {
    title: 'Test title',
    author: 'Elad Toorgeman',
  };
  await api.post('/api/blogs').send(newBlogWithoutUrl).expect(400);
});

test('blog deleted by id', async () => {
  const blogs = await Blog.find({});
  const firstBlogID = blogs[0].id;
  await api.delete(`/api/blogs/${firstBlogID}`);
  const blogsInDb = await Blog.find({});

  expect(blogsInDb).toHaveLength(initialBlogs.length - 1);
});

test('Blog likes updated', async () => {
  const blogs = await Blog.find({});
  const firstBlogID = blogs[0].id;
  const result = await api.put(`/api/blogs/${firstBlogID}`).send({ likes: 30 });
  const blogsInDb = await Blog.find({});
  const updatedFirstBlog = blogsInDb[0];
  expect(updatedFirstBlog.likes).toBe(30);
});

afterAll(async () => {
  await mongoose.connection.close();
});
