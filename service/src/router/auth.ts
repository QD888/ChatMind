import express from 'express'
import { login, register } from '../controllers/auth'
import type { AuthenticatedRequest } from './../utils/helper'

const router = express.Router()
router.get('/user', async (req: AuthenticatedRequest, res) => {
  console.log('current user: ', req.auth)
  res.setHeader('Content-type', 'application/json')
  res.send(JSON.stringify({ user: req.auth.user }))
})
router.post('/login', login)
router.post('/register', register)

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

export default router
