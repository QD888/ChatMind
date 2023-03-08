import AlipaySdk from 'alipay-sdk'
import Decimal from 'decimal.js'
const alipaySdk = new AlipaySdk({
  appId: '2021000122624232',
  gateway: 'https://openapi.alipaydev.com/gateway.do',
  alipayPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqsW87+VFbXiO5gcVlSI9uernugFcw/K3GoG596wUVYJHdmGZLdhhDqp1wCu2xjXcHIb9hV0xP239THJ7ikB6cyZvCl46e2bsGgad3okL5SALrI82CApTamteYLAv5NCV/xWq4C9EucKoFEwc7JbFkJBBLpQ9e4g9MmuBe1471GofkhUiKv/Emppcg9qZe7tmS+HIAojiv5OKquZvJoA+nkwoqwgXhv/naCv7qqpO4y7vRHU3wIiV0lxR2y82zhsTAI9qKakT8wuo6Hwzv7LxsEnMgEKME7dPsgX6Ovyjq3nr742Ed/Jl5q5ZYLlMUWIWiD51RMx23etzSkEL3jtVNwIDAQAB',
  privateKey: 'MIIEpQIBAAKCAQEAhVH8qCaOeyeh9doODJMoFGjGQ4rfJ1gKq5bvbXUOx0QmNBK34Awc6qsg5TDj+9zhtOqwlzR5Nfbq+SlYmEefFCkFNvuiAOndKGI5lHZXWTow8eaqCkQ/x2yMWoCsNea6xIq3e01iyS7LpV9evyVTRWB1gbVAK+LIswst06Tr9fMRd6TdwijNxOMOBitaJpOQPhvYN6ukBJhMgpBemdofUlozUFIizJCHEMua/QNHLFJkNtfruW4nBNRrHcrSf+dk7oebw6/Wa3FGzIxG28e6sHQ1MtujPTUJq/vydJLCS5IbvRiDvJJZwntDkMSpm2HN/p8/OU66XPO82ZuiarmzkwIDAQABAoIBABSZ4a/eHWA8dJN3+XnJ94SH2DMxr1/2A9gV/7NrRjhWeIzNY6p0VLeScAfacTBHJn19UoJa8mv7Vr3fvLfzQUqtOAgSBCud97W4z+r4CnFYQ53tpdLmTvCy/lEx1uqRV8TtJoMgJyatW3yXax2gV+i9igrcBimB5r97973fmzKq/heVXJM+VxR0jV3B0v45iP5/AgmLik5r+sEttjco4e9sdDGRuLDc0g/L3E6kz0w1jdkF8JF59DmhdTSjpFX0taVMN0vnKTTP6Gqi5jCvD1sZD/1J9mGWyCT4t+tSUkLwKn+IQEbqBDmVffsfba28tYi/+32Ee5xsL4ZXJtr8FlkCgYEA1RQRl84M8frAI6BNPwfQ5zMIIO7GELa67JKYeP1qItZj1wCNk6IslqsYmCX9V8mJlPGWe796K3GLKE/7sJjt/t7CgMDeukon3b72M1yme2lxYCLFxMA5boRxheTBB3c66tW8OxUOsMN1q0YRxmY2xJjo2TapW6lH7/yk+0/ftH8CgYEAoCz8jlzKhykrVoiSH6tMTHiPZHT3+3RVA/5qhutbGnuMTL06U8u7qLDHnF8fRB7WnEsmpuwcvWzE4RKyuDIgnc0wTG2oz/2QkJnTbr0oedhA3VhvXWzZyiEFr+Du8AKDsj0P/yoMI0FcafCel/KzLqwTeDLUDpHnTuj6qsrLZu0CgYEAhoZFFTJhueQ1qkhqfIDSwyTU3PXi1mqHWRS0bq6Pc68nGXaf67VXsUgUHvrdF6+FzSM5fqdE2mi1Ep5sqPHkUCUTZ3ZdJ//pa3ZEueikswW/LpLFiZJSsBOuGHpz4+LCr8CBNkv1GmRMxfVXA4tEyJpBZ+G6ysP1Ru6auo+TDMECgYEAh5TMyux8emA80OiVV701vl0mc1AXQH++Hr1SCpZZ7Va68ZITNy7yz92jeReDbbP00SNDunON+EGDfUjIguXbefdfdLI1/KiTn/K1Z70x78E/Vp0u1xP2XgQJvlBVsE9QjqTlT4WV9Jm00e/dLp0/UrhRWqMboKGb+811sPArsBkCgYEAxSilCsXiX5w+ece5nOD78PruYipa47M+m8NThsWoOrfW/D/HIyIYlskyyUkU5qUjyRQXvN7PyA9X51r7w6w3wsHp5YgDgp+CTRHl/srJUw73L2IXuMjnL5mlz8UTDxGbMwXPX8ChnCTa5/5VSNHAD+Ib8B7iI4cmTgCtD/4g4xc=',
})

// 计算时间戳的差值
export function countTimes(begin, end) {
  const timediff = Math.abs(end - begin)
  const mins = Math.floor(timediff / 1000 / 60)
  return mins
}

export function createOrderId() {
  return `chatmind${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Date.now()}`
}

export function createAmount(amount: number, delta = 0) {
  return new Decimal(amount).add(delta).toNumber()
}
export default alipaySdk

export default alipaySdk
