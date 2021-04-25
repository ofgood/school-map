import request from '../request/axios'

const api = {
  schoolList: '/baos/school/list', // 搜学校
  houseList: '/baos/house/list', // 搜小区
  getHouseBySchoolId: '/baos/school/houses', // 根据学校id 查询对应的小区
  getSchoolByHouseId: '/baos/house/schools', // 根据小区id
  getSchoolDetail: '/baos/school/detail',
  getHouseDetail: '/baos/house/detail',

  // 腾讯地图转换 经纬度api
  qqMapTranslate: '/ws/coord/v1/translate'
}
// 腾通地区基础地址
const qqMapBaseUrl = 'https://apis.map.qq.com'

// 搜索学校或小区
export function searchSchoolOrHouse(data, type) {
  return request.axios({
    method: 'GET',
    url: type === 'SCHOOL' ? api.schoolList : api.houseList,
    data
  })
}

export function getHouseBySchoolId(data) {
  return request.axios({
    method: 'GET',
    url: api.getHouseBySchoolId,
    data
  })
}

export function getSchoolByHouseId(data) {
  return request.axios({
    method: 'GET',
    url: api.getSchoolByHouseId,
    data
  })
}

export function qqMapTranslate(data) {
  return request.axios({
    baseUrl: qqMapBaseUrl,
    method: 'GET',
    url: api.qqMapTranslate,
    data: {
      type: 3,
      key: 'K5TBZ-OZCCJ-VSBFH-KZ24O-X4P2S-JEBIQ',
      ...data
    }
  })
}

export function getSchoolDetail(data) {
  return request.axios({
    method: 'GET',
    url: api.getSchoolDetail,
    data
  })
}

export function getHouseDetail(data) {
  return request.axios({
    method: 'GET',
    url: api.getHouseDetail,
    data
  })
}

