const mongoose = require('mongoose');

const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

let initialBlogs = [
  { title: 'Blog1', author: 'Elad1', url: 'url1', likes: 5 },
  { title: 'Blog2', author: 'Elad2', url: 'url2', likes: 10 },
  { title: 'Blog3', author: 'Elad3', url: 'url3', likes: 15 },
];
beforeEach(async () => {
  //create_user
  let newUser = {
    username: 'testuser',
    password: '12345',
    name: 'Elad',
  };
  await api.post('/api/users').send(newUser);

  //login user and get token
  const user = await api
    .post('/api/login')
    .send({ username: 'testuser', password: '12345' });
  const parsedUser = JSON.parse(user.text);
  const token = 'Bearer ' + parsedUser.token;

  await Blog.deleteMany({});
  await api
    .post('/api/blogs')
    .send(initialBlogs[0])
    .set('Authorization', token);
  await api
    .post('/api/blogs')
    .send(initialBlogs[1])
    .set('Authorization', token);
  await api
    .post('/api/blogs')
    .send(initialBlogs[2])
    .set('Authorization', token);

  //create user
  // await api
  //   .post('/api/users')
  //   .send({ username: 'testuser', name: 'test', password: '12345' });
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
  //login user
  const user = await api
    .post('/api/login')
    .send({ username: 'testuser', password: '12345' });
  const parsedUser = JSON.parse(user.text);

  const token = 'Bearer ' + parsedUser.token;
  await api.post('/api/blogs').send(newBlog).set('Authorization', token);

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
  //login user
  const user = await api
    .post('/api/login')
    .send({ username: 'testuser', password: '12345' });
  const parsedUser = JSON.parse(user.text);

  const token = 'Bearer ' + parsedUser.token;
  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', token);

  expect(response.body.likes).toBe(0);
});

test('title or url properties are required', async () => {
  const newBlogWithoutTitle = {
    author: 'Elad Toorgeman',
    url: 'www.blabla.com',
  };
  //login user
  const user = await api
    .post('/api/login')
    .send({ username: 'testuser', password: '12345' });
  const parsedUser = JSON.parse(user.text);

  const token = 'Bearer ' + parsedUser.token;
  await api
    .post('/api/blogs')
    .send(newBlogWithoutTitle)
    .set('Authorization', token)
    .expect(400);

  const newBlogWithoutUrl = {
    title: 'Test title',
    author: 'Elad Toorgeman',
  };
  await api
    .post('/api/blogs')
    .send(newBlogWithoutUrl)
    .set('Authorization', token)
    .expect(400);
});

test('blog deleted by id', async () => {
  const user = await api
    .post('/api/login')
    .send({ username: 'testuser', password: '12345' });

  const parsedUser = JSON.parse(user.text);
  const token = 'Bearer ' + parsedUser.token;
  console.log(user);
  const blogs = await Blog.find({});
  const firstBlogID = blogs[0].id;
  await api.delete(`/api/blogs/${firstBlogID}`).set('Authorization', token);
  const blogsInDb = await Blog.find({});

  expect(blogsInDb).toHaveLength(initialBlogs.length - 1);
}, 10000);

test('Blog likes updated', async () => {
  const blogs = await Blog.find({});
  const firstBlogID = blogs[0].id;
  const result = await api.put(`/api/blogs/${firstBlogID}`).send({ likes: 30 });
  const blogsInDb = await Blog.find({});
  const updatedFirstBlog = blogsInDb[0];
  expect(updatedFirstBlog.likes).toBe(30);
});

test('adding new blog without token not work', async () => {
  const newBlog = {
    title: 'New Blog',
    author: 'Elad Toorgeman',
    url: 'www.blabla.com',
  };

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect({ error: 'token not provided' });
});
afterAll(async () => {
  await mongoose.connection.close();
});
