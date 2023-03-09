import express from 'express'
import './env'
import { authenticate, generateRegex as generateApiRegex, updateRootAdminUser } from './utils/auth'
import { users } from './model'
import { Role } from './model/helper'
import routers from './router'
import type { AuthenticatedRequest } from './utils/helper'
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
app.use(async (req: AuthenticatedRequest, res, next) => {
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
app.use(async (req: AuthenticatedRequest, res, next) => {
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
app.use('', router)
app.use('/api', router)

app.listen(9090, () => globalThis.console.log('Server is running on port 9090'))
