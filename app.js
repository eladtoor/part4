const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

module.exports = app;

mongoose.set('strictQuery', false);

const mongoUrl =
  'mongodb+srv://eladtoordev:mNZBpDFrCKMPCohY@cluster0.kjcl6zv.mongodb.net/Blog?retryWrites=true&w=majority';
mongoose.connect(mongoUrl);

app.use(cors());
app.use(express.json());

module.exports = app;
