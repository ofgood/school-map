import request from '../request/axios'
// 腾讯地图地址
const qqMapBaseUrl = 'https://apis.map.qq.com'
// 腾讯地图key
const qqMapKey = 'K5TBZ-OZCCJ-VSBFH-KZ24O-X4P2S-JEBIQ'

// 百度地图地址
// http://api.map.baidu.com/geoconv/v1/?coords=114.21892734521,29.575429778924&from=1&to=5&ak=你的密钥 //GET请求
const baiduMapBaseUrl = 'http://api.map.baidu.com'
const baiduMapAk = 'R9XKzinYoZLt4UTZA9Rd7BkfGBGLf5qj'

// 图片下载地址
export const imgSrc = '/baos/upload/download/'
const api = {
  areaInfoList: '/baos/applets/areaInfo/list', // 图标数据
  houseDetail: '/baos/applets/house/detail', // 小区详情
  houseSchools: '/baos/applets/house/schools', // 小区对应学校/baos/applets/house/schools/{houseId}
  houseNearby: '/baos/applets/house/nearby', // 附近小区/baos/applets/house/nearby
  placeList: '/baos/applets/place/list', // 地图地点查询
  schoolDetail: '/baos/applets/school/detail', // 学校详情
  schoolHouses: '/baos/applets/school/houses', // 学校对应小区/baos/applets/school/houses/{schoolId}
  schoolNearby: '/baos/applets/school/nearby', // 附近学校
  scheduleList: '/baos/applets/schedule/list', // 日程
  scheduleAllEvent: '/baos/applets/schedule/allEvent', // 日程事件
  newsDetail: '/baos/applets/news/detail', // 文章详情
  policyLis: '/baos/applets/policy/list', // 政策列表
  getByType: '/baos/dictData/getByType', // 字典数据查询 /baos/dictData/getByType/{type}

  // 腾讯地图转换 经纬度api
  qqMapTranslate: '/ws/coord/v1/translate',
  // 百度地图转换
  baiduMapTranslate: '/geoconv/v1/'
}

/** 腾讯地图转换 */
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

/** 百度地图转换 */
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

/** 字典数据 GET /baos/dictData/getByType/{type}*/
export function getByType(type) {
  return request.axios({
    method: 'GET',
    url: api.getByType + '/' + type
  })
}

/** 图标数据 */
export function areaInfoList(data) {
  return request.axios({
    method: 'GET',
    url: api.areaInfoList,
    data
  })
}

/** 小区详情/baos/applets/house/detail*/
export function houseDetail(data) {
  return request.axios({
    method: 'GET',
    url: api.houseDetail,
    data
  })
}

/** 地图地点查询 GET /baos/applets/place/list*/
export function placeList(data) {
  return request.axios({
    method: 'GET',
    url: api.placeList,
    data
  })
}

/** 学校详情 GET /baos/applets/school/detail*/
export function schoolDetail(data) {
  return request.axios({
    method: 'GET',
    url: api.schoolDetail,
    data
  })
}

/** 学校对应小区 GET /baos/applets/school/houses/{schoolId}*/
export function schoolHouses(schoolId) {
  return request.axios({
    method: 'GET',
    url: api.schoolHouses + '/' + schoolId
  })
}

/** 小区对应学校/baos/applets/house/schools/{houseId} */
export function houseSchools(houseId) {
  return request.axios({
    method: 'GET',
    url: api.houseSchools + '/' + houseId
  })
}

/** 日程 GET /baos/applets/schedule/list*/
export function scheduleList(data) {
  return request.axios({
    method: 'GET',
    url: api.scheduleList,
    data
  })
}

/** 日程事件 GET /baos/applets/schedule/allEvent*/
export function scheduleAllEvent(data) {
  return request.axios({
    method: 'GET',
    url: api.scheduleAllEvent,
    data
  })
}

/** 文章详情 GET /baos/applets/news/detail*/
export function newsDetail(data) {
  return request.axios({
    method: 'GET',
    url: api.newsDetail,
    data
  })
}

/** 政策列表 GET /baos/applets/policy/list*/
export function policyLis(data) {
  return request.axios({
    method: 'GET',
    url: api.policyLis,
    data
  })
}

/** 附近学校 GET /baos/applets/school/nearby*/
export function schoolNearby(data) {
  return request.axios({
    method: 'GET',
    url: api.schoolNearby,
    data
  })
}

/** 附近小区 GET /baos/applets/house/nearby*/
export function houseNearby(data) {
  return request.axios({
    method: 'GET',
    url: api.houseNearby,
    data
  })
}

