/** API */
const {
  placeList
} = require('../../../api/school-map')

/** 工具函数 */
const {
  formatRecordsToMarkers,
  getIncludePointsFromMarkers
} = require('../../../utils/index')

/** 本地数据 */
const {
  areaMarkerData,
  areaMap
} = require('../../../dict/areaData')

/** ----------------Page----------------- */
Page({
  data: {
    cardOffsetTop: wx.getSystemInfoSync().windowHeight - 300,
    cardHeight: '300px',
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

    nativeMarkers: [],
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
    // 各个区展示出来
    this._includePoints(this._getPoints(areaMarkerData))
  },
  _setScrollViewHeight() {
    const customBottomCard = this.selectComponent('#customBottomCard')
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
    const _this = this
    _this.mapCtx.includePoints({ padding, points })
  },
  // 设置中心点
  _setCenter(longitude, latitude) {
    this.setData({
      longitude: longitude,
      latitude: latitude
    })
  },
  _getAreaNameById(id) {
    return areaMap[id + '']
  },
  async onTapCallout(e) {
    const { detail: { markerId }} = e
    this.setData({
      activeCoverId: markerId
    })
    // 获取区的学校
    const res = await placeList({
      area: this._getAreaNameById(markerId),
      type: 1,
      pageSize: 1000000,
      placeNature: 0,
      placeType: 0
    })
    if (res.success) {
      this.setData({
        markers: formatRecordsToMarkers(res.result.records)
      })
    }
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
    const customBottomCard = this.selectComponent('#customBottomCard')
    customBottomCard.setTranslate(0)
    this.setData({ isScrollY: false })
  },
  onOpenCard() {
    const customBottomCard = this.selectComponent('#customBottomCard')
    customBottomCard.setTranslate(-this.data.bottomDistance)
    this.setData({ isScrollY: false })
  },
  onTapBackToOrigin() {
    this.mapCtx.moveToLocation(this.latitude, this.longitude)
    this.setData({
      showNearBy: true
    })
  },
  onClickListItem() {
    wx.navigateTo({
      url: '/pages/main/detail/index'
    })
  },
  onClickComfirm(data) {
    console.log(data)
  }
})
