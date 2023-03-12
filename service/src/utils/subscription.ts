import { subscriptions, users } from '../model'
import { Role, SubscriptionPlan } from '../model/helper'
import processEnv from '@/env'

const FREE_TRAIL_MAX_TOKEN = processEnv.FREE_TRAIL_MAX_TOKEN ? parseInt(processEnv.FREE_TRAIL_MAX_TOKEN) : 100
const FREE_TRAIL_PERIOD = processEnv.FREE_TRAIL_PERIOD ? parseToMillis(processEnv.FREE_TRAIL_PERIOD) : 24 * 60 * 60 * 1000

export async function initFreeTrial(username: string) {
  const subscriptionId = generateSubscriptionId(username)
  await Promise.all([
    subscriptions.create(subscriptionId, {
      plan: SubscriptionPlan.FREE,
      start: new Date(),
      end: new Date(Date.now() + FREE_TRAIL_PERIOD),
      used: 0,
      max: FREE_TRAIL_MAX_TOKEN,
    }),
    users.update(username, { subscription: subscriptionId }),
  ])
}

export function generateSubscriptionId(username: string) {
  return `${username}-chatmind-subscription${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
}

export async function getUserSubscription(username) {
  const user = await users.read(username)
  if (user?.role === Role.ADMIN) {
    return {
      id: 'admin-subscription',
      plan: SubscriptionPlan.PREMIUM,
      start: new Date(Date.UTC(0, 11)),
      end: new Date(Date.UTC(9999, 11)),
      used: 0,
      max: Number.MAX_SAFE_INTEGER,
    }
  }
  const sub = user.subscription
  const subscription = await subscriptions.read(sub)
  return subscription
}

export async function updateUserSubcription(subscription) {
  if (subscription.id === 'admin-subscription')
    return true

  await subscriptions.update(subscription.id, subscription)
}

function parseToMillis(str) {
  const num = parseInt(str.slice(0, -1), 10)
  const unit = str.slice(-1)

  switch (unit) {
    case 's':
      return num * 1000
    case 'm':
      return num * 60 * 1000
    case 'h':
      return num * 60 * 60 * 1000
    case 'd':
      return num * 24 * 60 * 60 * 1000
    case 'M':
      return num * 30 * 24 * 60 * 60 * 1000 // assuming a month has 30 days
    case 'y':
      return num * 365 * 24 * 60 * 60 * 1000
    default:
      throw new Error(`Invalid time unit: ${unit}`)
  }
}
