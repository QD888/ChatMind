import express from 'express'
import { chatConfig } from '../chatgpt'

const router = express.Router()

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
