interface SendResponseOptions {
  type: 'Success' | 'Fail'
  message?: string
  data?: any
}

export function sendResponse(options: SendResponseOptions) {
  console.log('send resp', options)
  if (options.type === 'Success') {
    return Promise.resolve({
      message: options.message ?? null,
      data: options.data ?? null,
      status: options.type,
    })
  }

  // eslint-disable-next-line prefer-promise-reject-errors
  return Promise.reject({
    message: options.message ?? 'Failed',
    data: options.data ?? null,
    status: options.type,
  })
}
