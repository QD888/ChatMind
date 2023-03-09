import express from 'express'
import alipaySdk from '../utils/payment'

const router = express.Router()

router.post('/alipay/notify', async (req, res) => {
  console.log(req)

  console.log('notify params', req.params)
  console.log('notify body', req.body)

  if (req.body.trade_status === 'TRADE_SUCCESS') {
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

export default router
