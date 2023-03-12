import express from 'express'
import { orders, subscriptions, users } from '../model'
import { Role } from '../model/helper'
import alipaySdk, { calculateTokens, countTimes, createAmount, createOrderId } from '../utils/payment'
import processEnv from '@/env'

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

router.post('/alipay/pay', async (req, res) => {
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

router.post('/pay', async (req: any, res) => {
  // 订单号
  const id = createOrderId()

  // 订单金额
  const { amount: amountRaw } = req.body
  const amount = isNaN(+amountRaw) ? 1 : +amountRaw

  // 获取未支付订单列表
  const orderIt = orders.iterator()

  // 遍历订单
  const orderNoExpire: any[] = []

  for await (const [_, value] of orderIt) {
    const {
      createdAt,
      actualAmount,
      status,
    } = value
    // 获取2分钟未支付的订单
    if (countTimes(Date.parse(createdAt), Date.now()) <= 2 && !status) {
      // 如果存在
      orderNoExpire.push(actualAmount)
    }
  }

  console.log('current pending orders', orderNoExpire)

  // 判断是否有2分钟未支付的订单
  let needPay = 0
  if (orderNoExpire.length === 0) {
    needPay = amount
  }
  else {
    // 获取2分钟未支付的订单的最小金额-0.01
    const needPayMin = createAmount(Math.min(...orderNoExpire), -0.01)
    // 如果最小金额-0.01小于订单价格则获取2分钟未支付的订单的最大金额+0.01
    if (needPayMin < amount) {
      needPay = createAmount(Math.max(...orderNoExpire), 0.01)
    }
    else {
    // 否则使用最小金额-0.01
      needPay = needPayMin
    }
  }

  const maxOrders = processEnv.MAX_INFLIGHT_ORDERS ? isNaN(+processEnv.MAX_INFLIGHT_ORDERS) ? 10 : +processEnv.MAX_INFLIGHT_ORDERS : 10
  // 先判断未支付订单量是否超过X个
  if (orderNoExpire.length >= maxOrders) {
    // 超过X个订单未支付
    console.log('当前支付人数过多，请稍等再刷新页面！')
    res.status(503).send({
      status: 'Fail',
      message: '当前支付人数过多，请稍等再刷新页面！',
    })
  }
  else {
    // 创建订单
    const order = {
      user: req.auth.user,
      createdAt: new Date(),
      type: 'subcription',
      amount,
      actualAmount: needPay,
      tokens: calculateTokens(needPay),
      status: false,
    }
    await orders.create(id, order, 2 * 60_000)

    console.log(`创建订单成功！订单号：${id}，应付金额：${needPay}`, order)
    res.send({
      status: 'Success',
      message: 'Order created.',
      data: {
        id,
        ...order,
      },
    })
  }
})

router.post('/notify', async (req: any, res) => {
  const { id, amount: amountRaw } = req.body
  console.log(`amount raw: ${amountRaw}`)
  const amount = +amountRaw
  let orderMatch = null
  if (id) {
    const user = req.auth.user

    if (!isModerator((await users.read(user))?.role)) {
      res.status(404).send({
        status: 'Fail',
        message: `用户无权操作订单${id}`,
      })
      return
    }
    orderMatch = await orders.read(id)
    if (!orderMatch) {
      console.log(`订单 ${id} 不存在`)
      res.status(404).send({
        status: 'Fail',
        message: `订单 ${id} 不存在`,
      })
      return
    }
  }

  // use amount
  console.log(`using amount to verify order. amount=${amount}`)
  const orderIt = orders.iterator()

  for await (const [_, value] of orderIt) {
    const {
      createdAt,
      actualAmount,
      status,
    } = value
    if (actualAmount === amount && !status && countTimes(Date.parse(createdAt), Date.now()) <= 2) {
      orderMatch = value
      break
    }
  }

  if (!orderMatch) {
    console.log(`订单 amount=${amount} 不存在`)
    res.status(404).send({
      status: 'Fail',
      message: '订单不存在',
    })
    return
  }

  orderMatch.status = true
  await orders.update(orderMatch.id, orderMatch)

  // update user tokens

  console.log(`订单 ${orderMatch.id} 支付成功`)
  res.send({
    status: 'Success',
    message: `订单 ${orderMatch.id} 支付成功`,
  })

  const user = orderMatch.user

  if (!user)
    return

  const userInfo = await users.read(user)

  const subscriptionId = userInfo.subscription

  if (!subscriptionId) {
    console.log(`user ${user} has no active subscription`)
    return
  }

  const subscription = await subscriptions.read(subscriptionId)
  if (!subscription) {
    console.log(`user ${user} has no active subscription`)
    return
  }
  await subscriptions.update(subscriptionId, { max: subscription.max + orderMatch.tokens })
  console.log(`user ${user} subscription updated. current token used = ${subscription.used}, max token = ${subscription.max + orderMatch.tokens}, `)
})

router.get('/orders/:id', async (req, res) => {
  const { id } = req.params
  const order = await orders.read(id)
  if (!order) {
    console.log(`订单 ${id} 不存在`)
    res.status(404).send({
      status: 'Fail',
      message: `订单 ${id} 不存在`,
    })
    return
  }
  const { status, actualAmount } = order
  res.send({
    status: 'Success',
    data: {
      id,
      status,
      actualAmount,
    },
  })
})

export default router
function isModerator(role: string) {
  if (!role)
    return false

  if (role === Role.ADMIN || role === Role.MODERATOR)
    return true
  return false
}
