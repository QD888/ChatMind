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
  payments: Payment[]
  previous: string
}

export interface Payment {
  id: string
  user: User
  type: string
  amount: number
  actualAmount: number
  createdAt: Date
  status: boolean
}
