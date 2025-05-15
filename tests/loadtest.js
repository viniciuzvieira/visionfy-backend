import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 10, // usuários virtuais
  duration: '10s' // duração total do teste
}

export default function () {
  const res = http.get('http://localhost:4000/users')
  check(res, {
    'status 200': (r) => r.status === 200
  })
  sleep(1)
}
