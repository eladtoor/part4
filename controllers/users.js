const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');
const { request, response } = require('../app');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    url: 1,
    title: 1,
    author: 1,
    id: 1,
  });

  response.json(users);
});

usersRouter.get('/:id', async (request, response) => {
  const id = request.params.id;
  try {
    const document = await User.findById(id);
    response.json(document);
    // Do something with the found document
  } catch (error) {
    console.error(error);
    // Handle the error
  }
});

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body;

  if (password.length < 3) {
    return response.status(401).json({ error: 'Invalid Password' });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = await new User({ username, name, passwordHash });
    const savedUser = await user.save();
    return response.status(201).json(savedUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = usersRouter;
