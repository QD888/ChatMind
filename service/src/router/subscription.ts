import express from 'express'
import { getUserSubscription } from '../utils/subscription'

const router = express.Router()

router.get('/subscription', async (req: any, res) => {
  try {
    // get user subscription
    const subscription = await getUserSubscription(req.auth.user)

    res.send({ status: 'Success', message: 'Get subscription success', data: subscription })
  }
  catch (error) {
    res.send({ status: 'Fail', message: 'Get subscription failure', data: null })
  }
})

export default router
