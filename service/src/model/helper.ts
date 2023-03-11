export interface Token {
  id: string
  used: number
  max: number
  times: number[]
  type: string
}

export enum Role {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
}

export enum SubscriptionPlan {
  FREE = 'free',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

export interface User {
  username: string
  password: string
  firstName: string
  lastName: string
  email: string
  subscription: string
  role: Role
}

export interface Subscription {
  id: string
  plan: SubscriptionPlan
  start: Date
  end: Date
  used: number
  max: number
  orders: Order[]
  previous: string
}

export interface Order {
  id: string
  user: string
  type: string
  amount: number
  tokens: number
  actualAmount: number
  createdAt: Date
  status: boolean
}
