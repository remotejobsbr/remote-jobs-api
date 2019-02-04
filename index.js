// index.js

const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require("body-parser");

const githubAPI = require('./utils/githubAPI')

const app = express();

app.use(bodyParser.json({ strict: false }));

/*
** Routes
*/

app.get('/', (req, res) => {
  return res.send('working...');
})

// Get github rate limit
app.get('/github/rate_limit', (req, res) => {
  return githubAPI.rateLimit()
    .then(res.json.bind(res))
})

// Get all jobs from a category
app.get('/github/jobs/:category', (req, res) => {
  return githubAPI.fetchJobsByCategory(req.params.category)
    .then(res.json.bind(res))
})

// Get a jobs from a repository
app.get('/github/jobs/repository/:repository/:jobId', (req, res) => {
  const {
    repository,
    jobId,
  } = req.params

  return githubAPI.fetchJob(repository, jobId)
    .then(res.json.bind(res))
})

module.exports.handler = serverless(app);
