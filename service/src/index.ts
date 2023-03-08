import express from 'express'
import type { ChatContext, ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess } from './chatgpt'
import { auth } from './middleware/auth'
import { login } from './controllers/auth'
import { authenticate } from './utils/auth'
import {} from 'alipay-sdk'
import alipaySdk from './utils/payment'
import exp from 'constants'

const app = express()
const router = express.Router()

app.use(express.static('public'))
// app.use(express.json())
// app.use(express.urlencoded({extended:true}))

app.use((req, res, next) => {
  if (req.path !== '/alipay/notify') {
    express.json()(req, res, next); // use json middleware if path is /api/json
  } else {
    express.urlencoded({ extended: true })(req, res, next); // use urlencoded middleware if path is /api/urlencoded
  }
});


app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.get('/user', async (req, res) => {
  console.log(req.auth)
  res.setHeader('Content-type', 'application/json')
  res.send(JSON.stringify({ user: req.auth.user }))
})

router.post('/login', login)

router.post('/chat-process', auth, async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  try {
    const { prompt, options = {} } = req.body as { prompt: string; options?: ChatContext }
    let firstChunk = true
    await chatReplyProcess(prompt, options, (chat: ChatMessage) => {
      res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
      firstChunk = false
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = typeof AUTH_SECRET_KEY === 'string' && AUTH_SECRET_KEY.length > 0
    res.send({ status: 'Success', message: '', data: { auth: hasAuth } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})
router.post('/alipay/notify', async (req, res) => {
  console.log(req)

  console.log("notify params", req.params)
  console.log("notify body", req.body)

  if (req.params['trade_status'] === 'TRADE_SUCCESS') {
    console.log('async notify')
    console.log(req.params)
  }

  res.send("success")
})

router.post('/pay', async (req, res) => {
  const currentTime = Date.now() / 1000 // Convert to seconds


  const result = await alipaySdk.pageExec('alipay.trade.page.pay', {
    notify_url: 'http://ciyfs4.natappfree.cc/alipay/notify', // 通知回调地址
    bizContent: {
      out_trade_no: 'chatmindorder' + currentTime,
      total_amount: '0.01',
      subject: '测试订单',
      product_code: 'FAST_INSTANT_TRADE_PAY'
    },
    method: 'GET'
  });

  res.setHeader('Content-type', 'text/html')
  res.send(result)

  console.log(result)



})

app.use(authenticate.unless({ path: ['/login', '/register', '/alipay/notify'] }))
app.use((err, req, res, next) => {
  res.status(err.status).json(err)
})
app.use('', router)
app.use('/api', router)

app.listen(9090, () => globalThis.console.log('Server is running on port 3002'))
