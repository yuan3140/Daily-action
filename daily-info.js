const YEAR_DAY = '2021-02-11'
const FIRST_MEET_DAY = '2020-10-07'

const API_PREFIX = 'https://api.apishop.net/common'

const push_key = process.env.PUSH_KEY
const api_key = process.env.API_KEY

const rp = require('request-promise');

const DAY_COUNT = 24 * 60 * 60 * 1000
const yearLastDays = Math.ceil((Number(new Date(YEAR_DAY)) - Number(new Date())) / DAY_COUNT)
const meetDays = Math.ceil( ( Number(new Date()) - Number(new Date(FIRST_MEET_DAY)) ) / DAY_COUNT )


let merge = {}
merge.dayInfo = {
  notify: `亲爱的利，距离过年还有${yearLastDays}天了 🐶   
  这是我俩认识的第${meetDays}天，然鹅我们的饭还没约上 🐶  `
}

const sendNotification = async () => {
  let sckey = push_key.replace(/[\r\n]/g, '')

  const title = '利，粗大事了，快看看吧！！！'
  content = ''

  for (let i in merge) {
    content += merge[i].notify ? "\n\n" + merge[i].notify : ""
  }


  const options = {
    uri: `https://sc.ftqq.com/${sckey}.send`,
    form: { 
      text: title, 
      desp: content
    },
    json: true,
    method: 'POST'
  }

  let result = await rp.post(options)
  console.log("消息发送完毕", result.errno)
}

// 获取天气数据
const queryWeather = async () => {
  const options = {
    uri: `${API_PREFIX}/weather/queryBaseWeather`,
    form: {
      apiKey: api_key,
      city: '深圳'
    },
    json: true,
    method: 'POST'
  }

  const data = await rp.post(options)
  const { statusCode, result, desc } = data
  const weatherInfo = result[0]
  const {weather, humidity, temperature, winddirection, windpower } = weatherInfo
  if (statusCode === '000000') {
    merge.weather = {
      notify: `#### 今日天气: \n ${weather}, 气温: ${temperature}摄氏度, 空气湿度: ${humidity}, 风向: ${winddirection}风, 风力: ${windpower}级\n\n`

    } 
  }
}

// queryWeather()

// 获取今日名言
const queryAphorism = async () => {
  const options = {
    uri: `${API_PREFIX}/aphorism/queryAphorismTitleList`,
    form: {
      apiKey: api_key,
      type: 7
    },
    json: true,
    method: 'POST'
  }

  const data = await rp.post(options)
  const {statusCode, result} = data
  if (statusCode === '000000') {
    merge.aphorism = {
      notify: `#### 今日名言： ${result[0].title}  🐶`
    }
  }
}

// 获取今日笑话
const queryJoke = async () => {
  const options = {
    uri: `${API_PREFIX}/joke/getJokesByRandom`,
    form: {
      apiKey: api_key,
      pageSize: 10
    },
    json: true,
    method: 'POST'
  }
  const data = await rp.post(options)
  const {statusCode, result} = data
  if (statusCode === '000000') {
    merge.joke = {
      notify: `#### 今日笑话: 🐶\n${result.map((item, index) => (index + 1) + '. ' + item.content).join('\n')}` 
    }
  }
}

// 获取绕口令
const queryTongue = async () => {
  const options = {
    uri: `${API_PREFIX}/tongue/getTongueListByRandom`,
    form: {
      apiKey: api_key,
      pageSize: 6
    },
    json: true,
    method: 'POST'
  }
  const data = await rp.post(options)
  const { statusCode, result } = data
  if (statusCode === '000000') {
    merge.tongue = {
      notify: `#### 今日绕口令: 🐶\n${result.map((item, index) => (index + 1) + '. ' + item.content).join('\n')}` 
    }
  }
}

async function all() {
  // await Promise.all([
  //   queryAphorism(),
  //   queryWeather(),
  //   queryJoke(),
  //   queryTongue()
  // ])
  await queryWeather()
  await queryTongue()
  await queryJoke()
  await sendNotification()
}

all()
