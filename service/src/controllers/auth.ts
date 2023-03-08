import { generateToken, isAdmin } from 'src/utils/auth'

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
  res.setHeader('Content-type', 'application/json')
  res.send(loginFailed(username))
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
}
