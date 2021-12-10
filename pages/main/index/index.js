/** API */
const {
  placeList,
  schoolNearby,
  schoolHouses,
  houseSchools,
  policyLis
} = require('../../../api/school-map')

/** 工具函数 */
const {
  formatRecordsToMarkers
} = require('../../../utils/index')

/** 本地数据 */
const {
  areaMarkerData,
  areaMap
} = require('../../../dict/areaData')

/** 组件 */
// import Toast from 'path/to/@vant/weapp/dist/toast/toast'
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
    stopUp: true,

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
    currentLongitude: '',
    markerType: 'MARKER_AREA', // 默认区域类型
    areaName: '上海市',
    areaPlaceList: []
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
    // include到地图中
    this._includePoints(this._getPoints(areaMarkerData))
  },

  /**
   * marker类型
   * 区域类型->MARKER_AREA
   * 学校类型->MARKER_SCHOOL
   * 小区类型->MARKER_HOUSE
   * 小区对应学校类型->MARKER_HOUSE_SCHOOL
   * 学校对应小区类型->MARKER_SCHOOL_HOUSE
   * @param {*} markerType
   */
  _setMarkerType(markerType) {
    this.setData({
      markerType
    })
  },
  _isRegionchangeQuery() {
    const markerType = this.data.markerType
    return ['MARKER_SCHOOL', 'MARKER_HOUSE'].includes(markerType)
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
  _renderMarkers(markers, activeMarker) {
    console.log(activeMarker)
    const markersRes = activeMarker ? [activeMarker, ...formatRecordsToMarkers(markers)] : formatRecordsToMarkers(markers)
    this.setData({
      markers: markersRes
    })
  },
  _isAreaMark() {
    return !!this.data.markers.find(item => item.id === 101)
  },
  _activeMarker(markerId) {
    console.log(this.data.markers.find(item => item.id === markerId))
    return this.data.markers.find(item => item.id === markerId)
  },
  async _renderNearPlace({ latitude, longitude, distance = 2 }) {
    const res = await schoolNearby({
      distance,
      latitude,
      longitude
    })
    if (res.success) {
      if (res.result && res.result.length) {
        const markers = res.result.map(item => {
          return {
            ...item,
            type: 'school'
          }
        })
        this._renderMarkers(markers)
      } else {
        wx.showToast({
          title: '附近没有学校',
          icon: 'none'
        })
      }
    }
  },
  _backtoArea() {
    this.setData({
      markers: areaMarkerData
    })
  },
  async onTapCallout(e) {
    const { detail: { markerId }} = e
    const tapMark = this.data.markers.find(item => item.id === markerId) || {}
    console.log(markerId === this.data.activeCoverId)
    console.log(this.data.markerType !== 'MARKER_AREA')
    console.log(this.data.markerType)
    if (markerId === this.data.activeCoverId && this.data.markerType !== 'MARKER_AREA') {
      return
    }
    if (this.data.markerType === 'MARKER_AREA') {
      if (markerId !== 101 && tapMark.id) {
        wx.showToast({ title: '该区暂未开放', icon: 'none' })
        return
      }

      // 点击区域之后开始上划(暂时)
      this.setData({
        stopUp: false
      })

      // 点击区
      if (tapMark.id) {
        const { latitude, longitude } = tapMark
        this._setCenter(longitude, latitude)
        const nearRes = await schoolNearby({
          distance: 2,
          latitude,
          longitude
        })
        if (nearRes.success && nearRes.result && nearRes.result.length) {
          const markers = nearRes.result.map(item => {
            return {
              ...item,
              type: 'school'
            }
          })
          this.setData({
            mapScale: 14
          })
          this._setMarkerType('MARKER_SCHOOL')
          this._renderMarkers(markers)
        } else {
          wx.showToast({ title: '该区暂无学校', icon: 'none' })
          return
        }
        // 设置地区名称
        this.setData({
          areaName: this._getAreaNameById(tapMark.id)
        })
        // 默认查找学校
        const areaRes = await placeList({
          area: this._getAreaNameById(tapMark.id),
          pageNo: 1,
          pageSize: 10,
          type: 1
        })
        if (areaRes.success && areaRes.result.records && areaRes.result.records.length) {
          console.log(areaRes.result.records)
          this.setData({
            areaPlaceList: areaRes.result.records
          })
        }
        return
      }
    }

    // 点击学校, 把当前学校和查出来的对口小区合并在一起
    if ((this.data.markerType === 'MARKER_SCHOOL' || this.data.markerType === 'MARKER_HOUSE_SCHOOL') && tapMark.id) {
      const res = await schoolHouses(markerId)
      if (res.success) {
        if (res.result && res.result.length) {
          const activeSchoolMarker = this._activeMarker(markerId)
          activeSchoolMarker.type = 'school'
          const houseMarkers = res.result.map(item => {
            return {
              ...item,
              type: 'house'
            }
          })
          this._renderMarkers([...houseMarkers], activeSchoolMarker)
          this.setData({
            activeCoverId: markerId
          })
          this._setMarkerType('MARKER_SCHOOL_HOUSE')
        } else {
          wx.showToast({
            title: '无对应小区',
            icon: 'none'
          })
        }
      }
      return
    }
    // 点击小区,把当前小学和查出来的学校合并在一起
    if ((this.data.markerType === 'MARKER_SCHOOL_HOUSE' || this.data.markerType === 'MARKER_SCHOOL_HOUSE') && tapMark.id) {
      const res = await houseSchools(markerId)
      if (res.success) {
        if (res.result && res.result.length) {
          const activeHouseMarker = this._activeMarker(markerId)
          activeHouseMarker.type = 'house'
          const schoolMarkers = res.result.map(item => {
            return {
              ...item,
              type: 'school'
            }
          })
          this._renderMarkers([...schoolMarkers], activeHouseMarker)
          this.setData({ activeCoverId: markerId })
          this._setMarkerType('MARKER_HOUSE_SCHOOL')
        } else {
          wx.showToast({
            title: '无对应学校',
            icon: 'none'
          })
        }
      }
    }
  },
  onTapMarker(e) {
    console.log(e)
    // this.onOpenCard()
  },
  onRegionchange(e) {
    const { detail } = e
    const { centerLocation } = detail
    const { latitude, longitude } = centerLocation || {}
    const _this = this
    this.setData({
      currentLatitude: latitude,
      currentLongitude: longitude
    })
    if (e.type === 'end' && e.causedBy === 'drag') {
      if (!this._isRegionchangeQuery()) return
      if (!this._isAreaMark()) {
        _this._renderNearPlace({
          latitude,
          longitude
        })
      }
    }
    if (e.type === 'end' && e.causedBy === 'scale') {
      this.mapCtx.getScale({
        success(scaleData) {
          const { scale } = scaleData
          if (scale > 13) {
            if (!this._isRegionchangeQuery()) return
            _this._renderNearPlace({
              latitude,
              longitude
            })
          } else {
            _this._backtoArea()
            _this._setMarkerType('MARKER_AREA')
            this._includePoints(this._getPoints(areaMarkerData))
          }
        }
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
  },
  async onTapPolicy() {
    const res = await policyLis({
      area: this.data.areaName
    })
    console.log(res)
  },
  onTapCalendar() {

  }
})
