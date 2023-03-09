import express from 'express'
import type { AuthenticatedRequest } from 'src/utils/helper'
import { chatConfig } from '../chatgpt'

const router = express.Router()
router.get('/user', async (req: AuthenticatedRequest, res) => {
  console.log('current user: ', req.auth)
  res.setHeader('Content-type', 'application/json')
  res.send(JSON.stringify({ user: req.auth.user }))
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
