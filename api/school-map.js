import request from '../request/axios'
// 腾讯地图地址
const qqMapBaseUrl = 'https://apis.map.qq.com'
// 腾讯地图key
const qqMapKey = 'K5TBZ-OZCCJ-VSBFH-KZ24O-X4P2S-JEBIQ'

const api = {
  getSchoolDetail: '/baos/school/detail',
  getHouseDetail: '/baos/house/detail',
  getPlaceList: '/baos/place/list', // 整合学校和小区的接口
  getHouseNearby: '/baos/house/nearby', // 附近的小区
  getSchoolNearby: '/baos/school/nearby', // 附近的学校

  // 腾讯地图转换 经纬度api
  qqMapTranslate: '/ws/coord/v1/translate'
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
