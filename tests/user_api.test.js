const mongoose = require('mongoose');

const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');

const initialUsers = [
  {
    name: 'name1',
    username: 'user1',
    password: 'pass1',
  },
  {
    name: 'name2',
    username: 'user2',
    password: 'pass2',
  },
  {
    name: 'name3',
    username: 'user3',
    password: 'pass3',
  },
];

beforeEach(async () => {
  await User.deleteMany({});
  let userObject = new User(initialUsers[0]);
  await userObject.save();
  userObject = new User(initialUsers[1]);
  await userObject.save();
  userObject = new User(initialUsers[2]);
  await userObject.save();
});

describe('create user', () => {
  test('User not created with invalid password', async () => {
    const newInvalidUser = {
      name: 'name',
      username: 'user',
      password: 'pa',
    };
    await api
      .post('/api/users')
      .send(newInvalidUser)
      .expect(401)
      .expect({ error: 'Invalid Password' });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
