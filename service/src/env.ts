import * as dotenv from 'dotenv'

dotenv.config()

const processEnv = {
  AUTH_SECRET_KEY: process.env.AUTH_SECRET_KEY,
  TIMEOUT_MS: process.env.TIMEOUT_MS,
  USE_API_POOLING_DELETE_ON_FAIL: process.env.USE_API_POOLING_DELETE_ON_FAIL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_ACCESS_TOKEN: process.env.OPENAI_ACCESS_TOKEN,
  OPENAI_API_MODEL: process.env.OPENAI_API_MODEL,
  OPENAI_API_BASE_URL: process.env.OPENAI_API_BASE_URL,
  SOCKS_PROXY_HOST: process.env.SOCKS_PROXY_HOST,
  SOCKS_PROXY_PORT: process.env.SOCKS_PROXY_PORT,
  USE_API_KEY_POOLING: process.env.USE_API_KEY_POOLING,
  OPENAI_API_KEY_INITIAL_POOL_SIZE: process.env.OPENAI_API_KEY_INITIAL_POOL_SIZE,
  API_REVERSE_PROXY: process.env.API_REVERSE_PROXY,
  ADMIN_USER: process.env.ADMIN_USER,
  MAX_INFLIGHT_ORDERS: process.env.MAX_INFLIGHT_ORDERS,
  MAX_USER_COUNT: process.env.MAX_USER_COUNT,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  MYSQL_URL: process.env.MYSQL_URL,
  FREE_TRAIL_MAX_TOKEN: process.env.FREE_TRAIL_MAX_TOKEN,
  FREE_TRAIL_PERIOD: process.env.FREE_TRAIL_PERIOD,
}

export default processEnv
