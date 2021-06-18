import request from '../request/axios'
// 腾讯地图地址
const qqMapBaseUrl = 'https://apis.map.qq.com'
// 腾讯地图key
const qqMapKey = 'K5TBZ-OZCCJ-VSBFH-KZ24O-X4P2S-JEBIQ'

// 百度地图地址
// http://api.map.baidu.com/geoconv/v1/?coords=114.21892734521,29.575429778924&from=1&to=5&ak=你的密钥 //GET请求
const baiduMapBaseUrl = 'http://api.map.baidu.com'
const baiduMapAk = 'R9XKzinYoZLt4UTZA9Rd7BkfGBGLf5qj'

const api = {
  getSchoolDetail: '/baos/school/detail',
  getHouseDetail: '/baos/house/detail',
  getPlaceList: '/baos/place/list', // 整合学校和小区的接口
  getHouseNearby: '/baos/house/nearby', // 附近的小区
  getSchoolNearby: '/baos/school/nearby', // 附近的学校

  // 腾讯地图转换 经纬度api
  qqMapTranslate: '/ws/coord/v1/translate',
  // 百度地图转换
  baiduMapTranslate: '/geoconv/v1/'
}

export function qqMapTranslate(data) {
  return request.axios({
    baseUrl: qqMapBaseUrl,
    method: 'GET',
    url: api.qqMapTranslate,
    data: {
      type: 3,
      key: qqMapKey,
      ...data
    }
  })
}
export function baiduMapTranslate(data) {
  return request.axios({
    baseUrl: baiduMapBaseUrl,
    method: 'GET',
    url: api.baiduMapTranslate,
    data: {
      from: 3,
      to: 5,
      ak: baiduMapAk,
      ...data
    }
  })
}

export function getSchoolDetailById(data) {
  return request.axios({
    method: 'GET',
    url: api.getSchoolDetail,
    data
  })
}

export function getHouseDetailById(data) {
  return request.axios({
    method: 'GET',
    url: api.getHouseDetail,
    data
  })
}

export function getPlaceList(data) {
  return request.axios({
    method: 'GET',
    url: api.getPlaceList,
    data
  })
}

export function getHouseNearby(data) {
  return request.axios({
    method: 'GET',
    url: api.getHouseNearby,
    data
  })
}

export function getSchoolNearby(data) {
  return request.axios({
    method: 'GET',
    url: api.getSchoolNearby,
    data
  })
}
