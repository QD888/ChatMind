import express from 'express'
import './env'
import { authenticate, generateRegex as generateApiRegex, updateRootAdminUser } from './utils/auth'
import { users } from './model'
import { Role } from './model/helper'
import routers from './router'
import alipaySdk from './utils/payment'
// update admin user
updateRootAdminUser()

const app = express()
const router = express.Router()

router.use(...routers)

app.use(authenticate.unless({
  path: [
    generateApiRegex('login'),
    generateApiRegex('alipay\/notify'),
  ],
}))

// error handling for authentication
app.use((err, _req, res, _next) => {
  res.status(err.status).json(err)
})

app.use(express.static('public'))
// app.use(express.json())
// app.use(express.urlencoded({extended:true}))

// decode req parameters
app.use((req, res, next) => {
  if (req.path !== '/alipay/notify')
    express.json()(req, res, next) // use json middleware if path is /api/json

  else
    express.urlencoded({ extended: true })(req, res, next) // use urlencoded middleware if path is /api/urlencoded
})

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

// req.auth populate
app.use(async (req: any, res, next) => {
  if (req.auth) {
    // inject role info
    const user = await users.read(req.auth.user)
    req.auth.role = user?.role
  }
  console.log('populate auth', req.auth)
  next()
})

// authorization for admin user
const ADMIN_PRIVILEGED_PATHS = [
  generateApiRegex('register'),
]
app.use(async (req: any, res, next) => {
  console.log('admin authorization route')
  const test = ADMIN_PRIVILEGED_PATHS.find(pregx => pregx.test(req.path))
  if (test && req.auth?.role !== Role.ADMIN) {
    const msg = `User ${req.auth?.user} is not authorized to access path ${req.path}`
    res.status(401).json({ type: 'Fail', message: msg })
  }
  else {
    next()
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

  console.log('notify params', req.params)
  console.log('notify body', req.body)

  if (req.params.trade_status === 'TRADE_SUCCESS') {
    console.log('async notify')
    console.log(req.body)
  }

  res.send('success')
})

router.post('/pay', async (req, res) => {
  const currentTime = Date.now() / 1000 // Convert to seconds

  const result = await alipaySdk.pageExec('alipay.trade.page.pay', {
    notify_url: 'http://ciyfs4.natappfree.cc/alipay/notify', // 通知回调地址
    bizContent: {
      out_trade_no: `chatmindorder${currentTime}`,
      total_amount: '0.01',
      subject: '测试订单',
      product_code: 'FAST_INSTANT_TRADE_PAY',
    },
    method: 'GET',
  })

  res.setHeader('Content-type', 'text/html')
  res.send(result)

  console.log(result)
})

app.use(authenticate.unless({ path: ['/login', '/api/login', '/alipay/notify'] }))
app.use((err, _req, res, _next) => {
  res.status(err.status).json(err)
})
app.use('', router)
app.use('/api', router)

app.listen(9090, () => globalThis.console.log('Server is running on port 9090'))
