import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/company/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/admin/userInfo',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/company/logout',
    method: 'post'
  })
}
