import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/pro_order/page',
    method: 'get',
    params
  })
}

export function saveCg(data) {
  return request({
    url: '/pro_order/save',
    method: 'post',
    data
  })
}

export function delCg(data) {
  return request({
    url: '/pro_order/del',
    method: 'post',
    data
  })
}

export function changeCg(data) {
  return request({
    url: '/pro_order/alter',
    method: 'post',
    data
  })
}

export function importOrder(data) {
  return request({
    url: '/upload/company',
    method: 'post',
    data
  })
}