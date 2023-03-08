import { generateToken, isAdmin } from 'src/utils/auth'
import kv from 'src/utils/keyv'
function loginSuccess(user) {
  return {
    code: 200,
    status: 'Success',
    message: 'Login success.',
    data: {
      user,
      token: generateToken(user),
    },
  }
}

const login = async (req, res) => {
  const { username, password = '' } = req.body as { username: string; password?: string }
  if (isAdmin(username, password)) {
    res.send(loginSuccess(username))
    return
  }

  if (await kv.user?.has(username)) {
    const { password: encoded } = await kv.user?.get(username)
    if (matchPassword(password, encoded)) {
      res.send(loginSuccess(username))
      return
    }
  }
  res.setHeader('Content-type', 'application/json')
  res.send(loginFailed(username))
}

const register = async (req, res) => {
  const { firstName, lastName, username, password = '' } = req.body as { firstName: string; lastName: string; username: string; password?: string }

  if (process.env.ADMIN_USER === username || await kv.user?.has(username)) {
    res.send(registerFailed({ username }, 'User already exists.'))
    return
  }

  await kv.user?.set(username, {
    password,
    firstName,
    lastName,
  })

  res.send(registerSuccess({ firstName, lastName, username, password }))
}

function registerSuccess({ firstName, lastName, username, password }) {
  return {
    code: 200,
    status: 'Success',
    message: 'Register success.',
    data: {
      user: username,
      token: generateToken(username),
    },
  }
}

function registerFailed({ username }, reason) {
  return {
    code: 403,
    status: 'Failed',
    message: reason,
  }
}

function loginFailed(username: string): any {
  return {
    code: 401,
    status: 'Failed',
    message: `Login failed for user ${username}.`,
  }
}

export {
  login,
  register,
}
function matchPassword(password: string, encoded: any) {
  return password === encoded
}
