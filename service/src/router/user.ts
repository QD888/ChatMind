import express from 'express'
import { users } from 'src/model'
import { chatConfig } from '../chatgpt'

const router = express.Router()
router.get('/user', async (req: any, res) => {
  console.log('current user: ', req.auth)
  const user = await users.read(req.auth.user)

  if (!user) {
    res.send({
      code: 403,
      status: 'Fail',
      message: 'User not logged in',
    })
    return
  }
  res.send({
    code: 200,
    status: 'Success',
    data: {
      ...user,
    },
  })
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

export default router
