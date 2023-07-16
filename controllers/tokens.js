const tokensRouter = require('express').Router();

const jwt = require('jsonwebtoken');

tokensRouter.post('/', (request, response, next) => {
  const body = request.body;
  console.log(body);
  const token = body.token.replace('Bearer ', '');
  const decodedToken = jwt.verify(token, process.env.SECRET);
  const id = decodedToken.id;
  return response.send(id);
});

module.exports = tokensRouter;
