/** API */
const {
  placeList,
  schoolNearby,
  houseNearby,
  schoolHouses,
  houseSchools
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

import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { dicStore } from '../../../store/dic'

// import Toast from 'path/to/@vant/weapp/dist/toast/toast'
/** ----------------Page----------------- */
Page({
  behaviors: [storeBindingsBehavior],
  storeBindings: {
    store: dicStore,
    fields: ['dicMap'],
    // 需要调用的action
    actions: ['getDic', 'fetchAllDic']
  },
  data: {
    cardOffsetTop: wx.getSystemInfoSync().windowHeight - 300,
    cardHeight: '300px',
    tabsShow: true,
    showTopFilter: true,
    bottomDistance: 260,
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

    currentLatitude: '',
    currentLongitude: '',
    markerType: 'MARKER_AREA', // 默认区域类型
    areaName: '上海市',
    areaPlaceList: [],

    // 分页
    pageNo: 1,
    pageSize: 10,
    placeNature: '',
    type: '',
    placeType: '',
    area: '',
    listLoading: false,
    loadFinished: false,
    loadError: false
  },
  onLoad() {
    this.fetchAllDic()
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
  _renderMarkers(markers, activeMarker, isInclude) {
    const markersRes = activeMarker ? [...formatRecordsToMarkers(markers), activeMarker.id ? activeMarker : formatRecordsToMarkers([activeMarker])[0]] : formatRecordsToMarkers(markers)
    this.setData({
      markers: markersRes
    })
    if (isInclude) {
      this._includePoints(this._getPoints(markersRes))
    }
  },
  _isAreaMark() {
    return !!this.data.markers.find(item => item.id === 101)
  },
  _activeMarker(markerId) {
    return this.data.markers.find(item => item.id === markerId)
  },
  async _renderNearPlace({ latitude, longitude, distance = 2 }) {
    const { markerType } = this.data
    if (markerType === 'MARKER_SCHOOL') {
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
    }
    if (markerType === 'MARKER_HOUSE') {
      const res = await houseNearby({
        distance,
        latitude,
        longitude
      })
      if (res.success) {
        if (res.result && res.result.length) {
          const markers = res.result.map(item => {
            return {
              ...item,
              type: 'house'
            }
          })
          this._renderMarkers(markers)
        } else {
          wx.showToast({
            title: '附近没有小区',
            icon: 'none'
          })
        }
      }
    }
  },
  _backtoArea() {
    this.setData({
      markers: areaMarkerData
    })
  },
  /**
   * 渲染地点
   * @param {*} markerId
   * @param {*} place
   * @param {*} type //1 学校 // 2小区
   * @returns
   */
  async _renderPlace(markerId, place, type) {
    const tapMark = this.data.markers.find(item => item.id === markerId) || {}
    if (place) {
      tapMark.id = place.placeId
    }
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
        let nearRes = []
        if (type === 2) {
          nearRes = await houseNearby({
            distance: 2,
            latitude,
            longitude
          })
          this._setMarkerType('MARKER_HOUSE')
          this.setData({ type: 2 })
        } else {
          nearRes = await schoolNearby({
            distance: 2,
            latitude,
            longitude
          })
          this._setMarkerType('MARKER_SCHOOL')
          this.setData({ type: 1 })
        }
        if (nearRes.success && nearRes.result && nearRes.result.length) {
          const markers = nearRes.result.map(item => {
            return {
              ...item,
              type: type === 2 ? 'house' : 'school'
            }
          })
          this._renderMarkers(markers)
          this.setData({
            mapScale: 14
          })
        } else {
          wx.showToast({ title: type === 1 ? '该区暂无学校' : '暂无小区', icon: 'none' })
          return
        }
        // 设置地区名称
        this.setData({
          areaName: this._getAreaNameById(tapMark.id)
        })
        const areaRes = await placeList({
          area: this._getAreaNameById(tapMark.id),
          pageNo: 1,
          pageSize: 10,
          type
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
          const activeSchoolMarker = this._activeMarker(markerId) || place
          activeSchoolMarker.type = 'school'
          const houseMarkers = res.result.map(item => {
            return {
              ...item,
              type: 'house'
            }
          })
          this._renderMarkers([...houseMarkers], activeSchoolMarker, !!place)
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
    if ((this.data.markerType === 'MARKER_HOUSE' || this.data.markerType === 'MARKER_SCHOOL_HOUSE') && tapMark.id) {
      const res = await houseSchools(markerId)
      if (res.success) {
        if (res.result && res.result.length) {
          const activeHouseMarker = this._activeMarker(markerId) || place
          activeHouseMarker.type = 'house'
          const schoolMarkers = res.result.map(item => {
            return {
              ...item,
              type: 'school'
            }
          })
          this._renderMarkers([...schoolMarkers], activeHouseMarker, !!place)
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
  async onTapCallout(e) {
    const { detail: { markerId }} = e
    this._renderPlace(markerId, '', 1)
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
          }
          if (scale < 12) {
            _this._backtoArea()
            _this._setMarkerType('MARKER_AREA')
            _this.selectComponent('#customTopFilter').resetAll()
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
  // 跳转详情
  onClickListItem(data) {
    const { type, placeId } = data.detail
    wx.navigateTo({
      url: `/pages/main/detail/index?type=${type}&id=${placeId}`
    })
  },
  // 点击顶部筛选工具
  onClickComfirm(data) {
    console.log(data)
    const { detail: { type, area, placeNature, placeType, areaActiveId }} = data

    // 重置了区域,回到各个区的界面
    if (areaActiveId === 0) {
      this._setMarkerType('MARKER_AREA')
      this._backtoArea()
      this._includePoints(this.data.markers)
      return
    }
    if (areaActiveId !== 101) {
      wx.showToast({ title: '该区暂未开放', icon: 'none' })
      return
    }
    // 设置地区名称
    this.setData({
      areaName: this._getAreaNameById(areaActiveId),
      type,
      area,
      placeNature,
      placeType,
      areaActiveId,
      pageNo: 1,
      areaPlaceList: [],
      loadFinished: false
    })
    // this._backtoArea()
    this._setMarkerType('MARKER_AREA')
    this._renderPlace(areaActiveId, '', Number(type))
    this.getPlaceList()
  },
  async onTapPolicy() {
    const { areaName } = this.data
    wx.navigateTo({
      url: `/pages/main/policyList/index?area=${areaName}&type=policy`
    })
  },
  onTapCalendar() {
    const { areaName } = this.data
    wx.navigateTo({
      url: `/pages/main/policyList/index?area=${areaName}&type=calendar`
    })
  },
  onLoadMore(e) {
    const { loadFinished } = this.data
    if (loadFinished) {
      return
    }
    setTimeout(() => {
      let { pageNo } = this.data
      pageNo++
      this.setData({
        pageNo
      })
      this.getPlaceList()
    }, 300)
  },
  async getPlaceList() {
    const { areaName, type, placeNature, placeType, pageNo, pageSize } = this.data
    console.log(type)
    this.setData({
      listLoading: true
    })
    try {
      const list = []
      const res = await placeList({
        area: areaName,
        pageNo,
        pageSize: 10,
        type,
        placeNature,
        placeType
      })
      if (res.success) {
        const { areaPlaceList } = this.data
        const { result: { records = [] }} = res
        this.setData({
          areaPlaceList: [...areaPlaceList, ...records],
          listLoading: false
        })
        if (records.length < pageSize) {
          this.setData({
            loadFinished: true
          })
        }
      } else {
        this.setData({
          loadFinished: true,
          listLoading: false
        })
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
      return list
    } catch (error) {
      this.setData({
        loadFinished: true,
        searchLoading: false
      })
      wx.showToast({
        title: '出错了~',
        icon: 'none'
      })
      return []
    }
  }

})
