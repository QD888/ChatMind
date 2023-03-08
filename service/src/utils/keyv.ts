import Keyv from 'keyv'

const kv: {
  default: null | Keyv
  user: null | Keyv
  subcription: null | Keyv
} = {
  default: null,
  user: null,
  subcription: null,
}

if (process.env.MYSQL_URL) {
  const url = process.env.MYSQL_URL
  kv.default = new Keyv(url)
  kv.user = new Keyv(url, { namespace: 'user' })
  kv.subcription = new Keyv(url, { namespace: 'subcription' })
}

export default kv
