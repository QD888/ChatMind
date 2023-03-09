import Keyv from 'keyv'

const kv: {
  default: Keyv
  user: Keyv
  subcription: Keyv
  payment: Keyv
  token: Keyv
  create(namespace: string)
} = {
  default: null,
  user: null,
  subcription: null,
  payment: null,
  token: null,
  create: (namespace) => {
    if (process.env.MYSQL_URL) {
      const url = process.env.MYSQL_URL
      return new Keyv(url, { namespace })
    }
    else {
      return new Keyv({ namespace })
    }
  },
}

if (process.env.MYSQL_URL) {
  const url = process.env.MYSQL_URL
  kv.default = new Keyv(url)
  kv.user = new Keyv(url, { namespace: 'user' })
  kv.subcription = new Keyv(url, { namespace: 'subcription' })
  kv.payment = new Keyv(url, { namespace: 'payment' })
  kv.token = new Keyv(url, { namespace: 'token' })
}
else {
  kv.default = new Keyv()
  kv.user = new Keyv({ namespace: 'user' })
  kv.subcription = new Keyv({ namespace: 'subcription' })
  kv.payment = new Keyv({ namespace: 'payment' })
  kv.token = new Keyv({ namespace: 'token' })
}

export default kv
