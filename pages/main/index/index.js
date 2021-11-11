const {
  qqMapTranslate,
  getSchoolDetailById,
  getHouseDetailById,
  getHouseNearby,
  getSchoolNearby,
  baiduMapTranslate
} = require('../../../api/school-map')
const {
  translateQQLocation
} = require('../../../utils/index')
const {
  houseNatrue,
  schoolNatrue,
  schoolType
} = require('../../../dict/index')
const { areaMarkerData } = require('../../../dict/areaData')

Page({
  data: {
    cardOffsetTop: wx.getSystemInfoSync().windowHeight - 300,
    cardHeight: '300px',
    latitude: 32.079337,
    longitude: 121.592369,
    tabsShow: true,
    showTopFilter: true,
    bottomDistance: 230,
    isScrollY: false,
    scrollHeight: '',
    stopUp: false,

    duration: 300,
    position: 'center',
    round: false,

    houses: [],
    schoolName: '',
    schoolAddress: '',

    mainActiveIndex: 0,
    activeId: 101,

    markers: areaMarkerData,
    activeCoverId: '',
    mapScale: 11,
    activeName: '',
    markers2: [],

    option1: [
      { text: '附近1km', value: 1 },
      { text: '附近2km', value: 2 },
      { text: '附近3km', value: 3 }
    ],
    option2: [
      { text: '学校', value: 'school' },
      { text: '小区', value: 'house' }
    ],
    option3: [
      { text: '公办', value: 'a' },
      { text: '民办', value: 'b' }
    ],
    option4: [
      { text: '重点', value: 'a' },
      { text: '一般', value: 'b' }
    ],
    currentLatitude: '',
    currentLongitude: ''
  },
  onLoad() {
  },
  onUnload() {
  },
  onShow() {
  },
  onReady() {
    this._setScrollViewHeight()
    // 创建地图实例
    this.mapCtx = wx.createMapContext('myMap')
    // 初始化中心点
    this._initCenter()
  },
  _setScrollViewHeight() {
    const customBottomCard = this.selectComponent('#customBottomCard');
    this.setData({
      scrollHeight: customBottomCard.__data__.wrapHeight + 'px'
    })
  },
  // 获取当前位置
  _getCurPos() {
    return new Promise((resolve, rejeect) => {
      wx.getLocation({
        type: 'gcj02',
        altitude: true,
        isHighAccuracy: true,
        success(res) {
          resolve(res)
        },
        fail(err) {
          rejeect(err)
        }
      })
    })
  },
  async _initCenter() {
    const initPos = await this._getCurPos()
    const { longitude, latitude } = initPos
    if (longitude && latitude) {
      this._setCenter(longitude, latitude)
    }
  },
  _getPoints(markers) {
    const points = []
    markers.forEach(item => {
      const { latitude, longitude } = item
      if (latitude && longitude) {
        points.push({
          latitude,
          longitude
        })
      }
    })
    return points
  },
  _includePoints(points = [], padding = [100, 20, 300, 20]) {
    let _this = this
    _this.mapCtx.includePoints({padding, points})
  },
  // 设置中心点
  _setCenter(longitude, latitude) {
    this.setData({
      longitude: longitude,
      latitude: latitude
    })
  },
  // 百度转qq坐标
  async _getQqLocationByBaidu(lat, lng) {
    const translateRes = await qqMapTranslate({
      locations: `${lat},${lng}`
    })
    if (!translateRes.locations && translateRes.message) {
      return
    }
    return {
      latitude: translateRes.locations[0].lat,
      longitude: translateRes.locations[0].lng
    }
  },
  onTapCallout(e) {
    const { detail: { markerId } } = e
    this.setData({
      activeCoverId: markerId
    })
    setTimeout(() => {
      this.setData({
        activeCoverId: ''
      })
    },200)
  },
  onTapMarker(e) {
    console.log(e)
    // this.onOpenCard()
  },
  onRegionchange(e) {
    if (this.data.showNearBy && (e.type === 'end')) {
      const { detail } = e
      const { distance, queryPlaceType } = this.data
      const { centerLocation } = detail
      const { latitude, longitude } = centerLocation
      this.setData({
        currentLatitude: latitude,
        currentLongitude: longitude
      })
    }
  },
  onClickTopSearch(data) {
    wx.navigateTo({
      url: '/pages/main/search/index'
    })
  },
  onSelectItem(e) {
    const locId = e.currentTarget.id
    const { type } = e.currentTarget.dataset.place // type--2 对应小区,type--1 对应学校
  },
  onClickNav({ detail = {}}) {
    this.setData({
      mainActiveIndex: detail.index || 0
    })
  },
  onClickItem({ detail = {}}) {
    const activeId = this.data.activeId === detail.id ? null : detail.id
    this.setData({ activeId })
  },
  onReachTop() {
    this.setData({ showTopFilter: false, isScrollY: true })
  },
  onReachBottom() {
    this.setData({ showTopFilter: true, isScrollY: false })
  },
  onCloseCard() {
    const customBottomCard = this.selectComponent('#customBottomCard');
    customBottomCard.setTranslate(0)
    this.setData({ isScrollY: false })
  },
  onOpenCard() {
    const customBottomCard = this.selectComponent('#customBottomCard');
    customBottomCard.setTranslate(-this.data.bottomDistance)
    this.setData({ isScrollY: false })
  },
  onTapBackToOrigin() {
    this.mapCtx.moveToLocation(this.latitude, this.longitude)
    this.setData({
      showNearBy: true
    })
    this.onReady()
  },
  onClickListItem() {
    wx.navigateTo({
      url: '/pages/main/detail/index'
    })
  }
})
