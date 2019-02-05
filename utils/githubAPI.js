const { flatten, sort } = require('ramda')
const axios = require('axios')

const githubAPIKey = process.env.GITHUB_KEY;

const instance = axios.create({
  baseURL: `https://api.github.com`,
})

if (githubAPIKey && githubAPIKey !== 'undefined')
  instance.defaults.headers.common['Authorization'] = `token ${githubAPIKey}`;

// Endpoints
const jobEndpoints = {
  frontendbr: '/repos/frontendbr/vagas/issues?labels=Remoto&state=open',
  ['react-brasil']:
    '/repos/react-brasil/vagas/issues?labels=aloca%C3%A7%C3%A3o/Remoto&state=open',
  backendbr: '/repos/backend-br/vagas/issues?labels=Remoto&state=open',
  soujava: '/repos/soujava/vagas-java/issues?labels=Remoto&state=open',
  androiddevbr: '/repos/androiddevbr/vagas/issues?labels=Remoto&state=open',
  cocoaheadsbrasil:
    '/repos/CocoaHeadsBrasil/vagas/issues?labels=Remoto&state=open',
  phpdevbrasil:
    '/repos/phpdevbr/vagas/issues?labels=aloca%C3%A7%C3%A3o/Remoto&state=open'
}

const repoNameByOwner = {
  frontendbr: 'vagas',
  ['react-brasil']: 'vagas',
  backendbr: 'vagas',
  soujava: 'vagas-java',
  androiddevbr: 'vagas',
  cocoaheadsbrasil: 'vagas',
  phpdevbrasil: 'vagas'
}

const serviceNamesByCategory = {
  frontend: ['frontendbr', 'react-brasil'],
  backend: ['backendbr', 'soujava', 'phpdevbrasil'],
  mobile: ['androiddevbr', 'cocoaheadsbrasil']
}

const fetchJobs = jobServiceName => {
  return instance
    .get(jobEndpoints[jobServiceName])
    .then(res => res.data)
    .catch(console.error.bind(console))
}

const fetchJobsByCategory = category => {
  const getTime = isoString => (new Date(isoString)).getTime()

  return Promise.all(serviceNamesByCategory[category].map(fetchJobs))
    .then(res =>
      res.map((repositoryResult, index) =>
        repositoryResult.map(vacancy =>
          Object.assign(vacancy, {
            service_name: serviceNamesByCategory[category][index]
          })
        )
      )
    )
    .then(flatten)
    .then(
      sort(
        (a, b) =>
          getTime(b.created_at) - getTime(a.created_at)
      )
    )
    .catch(console.error)
}

const fetchJob = (repositoryName, issueNumber) => {
  /**
   * Workaround to works with the old url in production
   * @TODO: Remove this logic 10 july 2019
   */
  const safeRepositoryName = repositoryName === 'reactbrasil'
    ? 'react-brasil'
    : repositoryName;

  return instance
    .get(
      `/repos/${safeRepositoryName}/${
      repoNameByOwner[safeRepositoryName]
      }/issues/${issueNumber}`
    )
    .then(res => ({
      ...res.data,
      service_name: safeRepositoryName
    }))
}

const rateLimit = () => {
  return instance.get('/rate_limit').then(res => res.data)
}

module.exports.jobEndpoints = jobEndpoints
module.exports.repoNameByOwner = repoNameByOwner
module.exports.serviceNamesByCategory = serviceNamesByCategory
module.exports.fetchJobs = fetchJobs
module.exports.fetchJobsByCategory = fetchJobsByCategory
module.exports.fetchJob = fetchJob
module.exports.rateLimit = rateLimit

module.exports.default = instance
