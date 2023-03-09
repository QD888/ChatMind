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

export interface User {
  username: string
  password: string
  firstName: string
  lastName: string
  subscription: Subscription
  role: Role
}

export interface Subscription {
  id: string
  plan: string
  start: Date
  end: Date
  used: number
  max: number
  payments: Payment[]
}

export interface Payment {
  id: string
  user: User
  type: string
  amount: number
}
