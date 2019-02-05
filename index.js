const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');

const githubAPI = require('./utils/githubAPI')

const app = express();

app.use(cors());
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
  return githubAPI
    .fetchJobsByCategory(req.params.category)
    .then(res.json.bind(res))
    .catch(error =>
      res.status(404).json({
        error: error.message
      })
    );
})

// Get a job from a repository
app.get('/github/jobs/repository/:repository/:jobId', (req, res) => {
  const {
    repository,
    jobId,
  } = req.params

  return githubAPI
    .fetchJob(repository, jobId)
    .then(res.json.bind(res))
    .catch((error) => res.status(404).json({
      error: error.message,
    }))
})

module.exports.handler = serverless(app);
