import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/pro_spec/list',
    method: 'get',
    params
  })
}

export function saveCg(data) {
  return request({
    url: '/pro_spec/save',
    method: 'post',
    data
  })
}

export function delCg(data) {
  return request({
    url: '/pro_spec/del',
    method: 'post',
    data
  })
}

export function changeCg(data) {
  return request({
    url: '/pro_spec/alter',
    method: 'post',
    data
  })
}