import type Keyv from 'keyv'
import kv from '../utils/keyv'
import type { Payment, Subscription, Token, User } from './helper'

class BaseModel<T> {
  store: Keyv
  entityName: string
  constructor(entityName) {
    this.store = kv.create(entityName)
    this.entityName = entityName
  }

  async create(id, data: Partial<T>, ttl: number | undefined = undefined) {
    return ttl ? await this.store.set(id, { id, ...data }, ttl) : await this.store.set(id, { [id]: id, ...data })
  }

  async read(id) {
    return this.store.get(id)
  }

  async update(id, data: Partial<T>) {
    return await this.store.set(id, { ...(await this.read(id)), ...data })
  }

  async delete(id) {
    return await this.store.delete(id)
  }

  async has(id) {
    return await this.store.has(id)
  }

  iterator(): AsyncGenerator<any, void, T> {
    return this.store.iterator()
  }
}

class TokenModel extends BaseModel<Token> {
  static readonly NAMESPACE = 'token'

  constructor() {
    super(TokenModel.NAMESPACE)
  }
}

class UserModel extends BaseModel<User> {
  static readonly NAMESPACE = 'user'
  constructor() {
    super(UserModel.NAMESPACE)
  }
}

class SubscriptionModel extends BaseModel<Subscription> {
  static readonly NAMESPACE = 'subscription'
  constructor() {
    super(SubscriptionModel.NAMESPACE)
  }
}

class PaymentModel extends BaseModel<Payment> {
  static readonly NAMESPACE = 'payment'
  constructor() {
    super(PaymentModel.NAMESPACE)
  }
}

const users = new UserModel()
const subscriptions = new SubscriptionModel()
const tokens = new TokenModel()
const payments = new PaymentModel()
export {
  users,
  subscriptions,
  tokens,
  payments,
}
