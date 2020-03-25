import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/pro_type/page',
    method: 'get',
    params
  })
}

export function saveCg(data) {
  return request({
    url: '/pro_type/save',
    method: 'post',
    data
  })
}

export function delCg(data) {
  return request({
    url: '/pro_type/del',
    method: 'post',
    data
  })
}

export function changeCg(data) {
  return request({
    url: '/pro_type/alter',
    method: 'post',
    data
  })
}