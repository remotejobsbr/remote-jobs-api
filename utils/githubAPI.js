const { flatten, sort } = require('ramda')
const axios = require('axios')

const githubAPIKey = process.env.GITHUB_KEY || '2f21c58487adab20ef375502d5c6542c63151107';

const instance = axios.create({
  baseURL: `https://api.github.com`,
})

if (githubAPIKey && githubAPIKey !== 'undefined')
  instance.defaults.headers.common['Authorization'] = `token ${githubAPIKey}`;

// Endpoints
const jobEndpoints = {
  frontendbr: '/repos/frontendbr/vagas/issues?labels=Remoto&state=open',
  ['react-brasil']:
    '/repos/react-brasil/vagas/issues?labels=%F0%9F%8F%A2%20Remoto&state=open',
  backendbr: '/repos/backend-br/vagas/issues?labels=Remoto&state=open',
  soujava: '/repos/soujava/vagas-java/issues?labels=Remoto&state=open',
  androiddevbr: '/repos/androiddevbr/vagas/issues?labels=Remoto&state=open',
  cocoaheadsbrasil:
    '/repos/CocoaHeadsBrasil/vagas/issues?labels=Remoto&state=open',
  phpdevbrasil:
    '/repos/phpdevbr/vagas/issues?labels=aloca%C3%A7%C3%A3o/Remoto&state=open',
  ['vuejs-br']: '/repos/vuejs-br/vagas/issues?q=is%3Aopen+is%3Aissue+label%3ARemoto',
  ['qa-brasil']: '/repos/qa-brasil/vagas/issues?q=is%3Aopen+is%3Aissue+label%3ARemoto',
  uxbrasil: '/repos/uxbrasil/vagas/issues?q=is%3Aopen+is%3Aissue+label%3ARemoto',
  Gommunity: '/repos/Gommunity/vagas/issues?q=is%3Aopen+is%3Aissue+label%3ARemoto',
  ['flutter-brazil']: '/repos/flutter-brazil/vagas/issues?q=is%3Aopen+is%3Aissue+label%3ARemoto',
  ['trabalho-remoto-vagas']: '/repos/remotejobsbr/trabalho-remoto-vagas/issues',
}

const repoNameByOwner = {
  frontendbr: 'vagas',
  ['react-brasil']: 'vagas',
  backendbr: 'vagas',
  soujava: 'vagas-java',
  androiddevbr: 'vagas',
  cocoaheadsbrasil: 'vagas',
  phpdevbrasil: 'vagas',
  ['vuejs-br']: 'vagas',
  ['qa-brasil']: 'vagas',
  uxbrasil: 'vagas',
  Gommunity: 'vagas',
  ['flutter-brazil']: 'vagas',
  ['trabalho-remoto-vagas']: 'trabalho-remoto-vagas',
}

const serviceNamesByCategory = {
  frontend: ['frontendbr', 'react-brasil', 'vuejs-br'],
  backend: ['backendbr', 'soujava', 'phpdevbrasil', 'Gommunity'],
  mobile: ['androiddevbr', 'cocoaheadsbrasil', 'flutter-brazil'],
  qa: ['qa-brasil'],
  ux: ['uxbrasil'],
  geral: ['trabalho-remoto-vagas']
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
            category,
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

const fetchAllJobs = () => {
  const categories = Object.keys(serviceNamesByCategory)
  return Promise
    .all(categories.map(category => fetchJobsByCategory(category)))
    .then(flatten)
}

const fetchJob = (repositoryName, issueNumber) => {
  const safeOwnerName = ({
    reactbrasil: 'react-brasil',
    ['trabalho-remoto-vagas']: 'remotejobsbr'
  })[repositoryName] || repositoryName

  return instance
    .get(
      `/repos/${safeOwnerName}/${
      repoNameByOwner[repositoryName]
      }/issues/${issueNumber}`
    )
    .then(res => ({
      ...res.data,
      service_name: repositoryName
    }))
}

const rateLimit = () => {
  return instance.get('/rate_limit').then(res => res.data)
}

module.exports.jobEndpoints = jobEndpoints
module.exports.repoNameByOwner = repoNameByOwner
module.exports.serviceNamesByCategory = serviceNamesByCategory
module.exports.fetchJobs = fetchJobs
module.exports.fetchAllJobs = fetchAllJobs
module.exports.fetchJobsByCategory = fetchJobsByCategory
module.exports.fetchJob = fetchJob
module.exports.rateLimit = rateLimit

module.exports.default = instance
