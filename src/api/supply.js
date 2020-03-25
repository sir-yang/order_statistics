import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/company/page',
    method: 'get',
    params
  })
}

export function supplyList(params) {
  return request({
    url: '/company/list',
    method: 'get',
    params
  })
}

export function saveCg(data) {
  return request({
    url: '/company/save',
    method: 'post',
    data
  })
}

export function delCg(data) {
  return request({
    url: '/company/del',
    method: 'post',
    data
  })
}

export function changeCg(data) {
  return request({
    url: '/company/alter',
    method: 'post',
    data
  })
}