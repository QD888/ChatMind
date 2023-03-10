import express from 'express'
import type { ChatContext, ChatMessage } from '../chatgpt'
import { auth } from '../middleware/auth'
import { chatReplyProcess } from '../chatgpt'
import { getUserSubscription, updateUserSubcription } from '../utils/subscription'

const router = express.Router()

router.post('/chat-process', auth, async (req: any, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  // get current token used
  const subscription = await getUserSubscription(req.auth.user)

  let used = subscription.used
  const max = subscription.max

  console.log(subscription)
  const end = Date.parse(subscription.end)
  if (end - Date.now() < 0) {
    console.log('subscription expired')

    res.write(JSON.stringify({ type: 'Fail', message: 'ChatGPT error 403: You subscription has expired.' }))
    res.end()
    return
  }

  function precheck(numTokens) {
    // change used
    used += numTokens

    console.log(`For user: ${req.auth.user}, numTokens: ${numTokens}, used: ${used}, max: ${max}`)

    return max >= used
  }

  function postProcess(numTokens) {
    // change used
    used += numTokens
    console.log(`For user: ${req.auth.user}, numTokens: ${numTokens}, used: ${used}, max: ${max}`)
  }

  let shouldUpdateSubscription = true
  try {
    const { prompt, options = {} } = req.body as { prompt: string; options?: ChatContext }
    let firstChunk = true
    await chatReplyProcess(prompt, options, (chat: ChatMessage) => {
      res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
      firstChunk = false
    }, { precheck: precheck.bind(used), postProcess: postProcess.bind(used) })
  }
  catch (error) {
    // console.log(JSON.stringify(error))
    res.write(JSON.stringify(error))
    shouldUpdateSubscription = false
  }
  finally {
    if (shouldUpdateSubscription)
      updateUserSubcription({ ...subscription, used: used > subscription.max ? subscription.max : used })
    res.end()
  }
})

export default router
