const { path } = require('ramda')
const moment = require('moment')

const TelegramBot = require('node-telegram-bot-api')

const token = process.env.TELEGRAM_KEY

const githubAPI = require('./githubAPI')

const telegramBot = () => {
  const bot = new TelegramBot(token, {polling: true})

  bot.sendMessage('@xabablau', 'Call!!')

  githubAPI.fetchAllJobs()
    .then(res => (res || []).map(job => ({
      id: path(['number'], job),
      title: path(['title'], job),
      url: `https://remotejobsbr.com/jobs/${path(['category'], job)}/${path(['service_name'], job)}/${path(['number'], job)}`,
      createdAt: path(['created_at'], job),
    })))
    .then(res => res.filter(job => moment(job.createdAt).isSameOrAfter(moment().subtract(30, 'minutes'))))
    .then(res => res.forEach(job => bot.sendMessage('@xabablau', `${job.title}: ${job.url}`)))
}

module.exports = telegramBot
