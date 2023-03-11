import express from 'express'
import { users } from 'src/model'
import { authInfo, hashPassword, updateUser } from 'src/utils/auth'
import { login, register } from '../controllers/auth'

const router = express.Router()
router.get('/user', async (req: any, res) => {
  const user = await users.read(req.auth.user)
  // console.log('current user: ', req.auth, user)

  if (!user) {
    res.send({
      code: 403,
      status: 'Fail',
      message: 'User not logged in',
    })
    return
  }
  delete (user.password)
  res.send({
    code: 200,
    status: 'Success',
    data: {
      ...user,
      // not including password field
    },
  })
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

// admin / moderator related api, like reseting all JWT, update a user's password etc
// reset all JWT tokens
router.post('/admin/reset-jwt', async (req, res) => {
  try {
    // reset all JWT tokens
    authInfo.jwtResetTimestamp = Date.now()
    res.send({ status: 'Success', message: 'All JWT tokens have been reset', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

// update a user's password
router.post('/admin/update-password', async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string }

    if (!username)
      throw new Error('username is empty')

    if (!password)
      throw new Error('New password is invalid')

    // update the user's password here
    const user = await users.read(username)

    if (!user) {
      const errMessage = `user ${username} does not exist`
      console.log(errMessage)
      throw new Error(errMessage)
    }

    user.password = hashPassword(password)

    await updateUser(user)
    console.log(`user ${username} updated.`, user)
    res.send({ status: 'Success', message: 'Password has been updated', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

export default router
