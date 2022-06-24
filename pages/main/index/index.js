/** API */
const {
  placeList,
  schoolNearby,
  houseNearby,
  schoolHouses,
  houseSchools,
  areaInfoList
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
    cardHeight: '340px',
    tabsShow: true,
    showTopFilter: true,
    bottomDistance: 310,
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
    activeId: -101,

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
    loadError: false,
    // 区域信息
    areaData: [],
    matchPlaceList: [],
    nearRes: [],
    // 学校和小区对应列表
    areaMapData: [],
    flagNum: 0,
    // 提示
    showInfoTip: true,
    isSearchModel: false,
    // 展示图标
    showAreaData: true
  },
  onLoad() {
    this.fetchAllDic()
    this._getAreaInfoList({
      'area': '',
      'city': '',
      'province': '上海市',
      'type': 1,
      'year': new Date().getFullYear()
    })
  },
  onReady() {
    // 设置底部卡片滚动高度
    this._setScrollViewHeight()
    // 创建地图实例
    this.mapCtx = wx.createMapContext('myMap')
    // this.mapCtx.getCenterLocation({
    //   success(data) {
    //     console.log(data)
    //   }
    // })
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
  _setScrollViewHeight() {
    const customBottomCard = this.selectComponent('#customBottomCard')
    this.setData({
      scrollHeight: customBottomCard.__data__.wrapHeight + 'px'
    })
  },
  // 获取图表数据
  _getAreaInfoList(params) {
    this.setData({ showAreaData: true })
    areaInfoList({
      ...params
    }).then(res => {
      if (res.success) {
        const { result } = res
        if (result.length) {
          const {
            nurseryStudentNum,
            nurserySchoolNum,
            nurseryStudentRate,
            primaryStudentNum,
            primarySchoolNum,
            primaryStudentRate,
            juniorStudentNum,
            juniorSchoolNum,
            juniorStudentRate,
            seniorStudentNum,
            seniorStudentRate,
            seniorSchoolNum
          } = result[0]
          this.setData({
            showAreaData: true,
            areaData: [
              {
                rate: nurseryStudentRate,
                type: 'nursery',
                schoolCount: nurserySchoolNum,
                studentCount: nurseryStudentNum
              },
              {
                rate: primaryStudentRate,
                type: 'primary',
                schoolCount: primarySchoolNum,
                studentCount: primaryStudentNum
              },
              {
                rate: juniorStudentRate,
                type: 'middle',
                schoolCount: juniorSchoolNum,
                studentCount: juniorStudentNum
              },
              {
                rate: seniorStudentRate,
                type: 'high',
                schoolCount: seniorStudentNum,
                studentCount: seniorSchoolNum
              }
            ]
          })
        } else {
          this.setData({
            showAreaData: false
          })
        }
      }
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
  // 获取经纬度数组,渲染markers
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
  // 把所有的点 包含在屏幕可视范围内渲染
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
  // 获取区域名称
  _getAreaNameById(id) {
    return areaMap[id + '']
  },
  /**
   * 渲染markers
   * @param {Array} markers
   * @param {Object} activeMarker 被选中的
   * @param {Boolean} isInclude 是否都在可视范围内
   */
  _renderMarkers(markers, activeMarker, isInclude) {
    const markersRes = activeMarker ? [...formatRecordsToMarkers(markers), activeMarker.id ? activeMarker : formatRecordsToMarkers([activeMarker])[0]] : formatRecordsToMarkers(markers)
    this.setData({
      markers: markersRes
    })
    if (isInclude) {
      this._includePoints(this._getPoints(markersRes))
    }
  },

  // 判断是否是学校类型和小区类型,只有这两种类型移动地图的时候才去查询数据
  _isRegionchangeQuery() {
    const markerType = this.data.markerType
    return ['MARKER_SCHOOL', 'MARKER_HOUSE'].includes(markerType)
  },

  /**
   * 是否是区域marker
   * @returns {Boolean}
   */
  _isAreaMark() {
    return !!this.data.markers.find(item => areaMarkerData.some(el => el.id === item.id))
  },

  /**
   * 获取当前marker
   * @param {Number} markerId
   * @returns
   */
  _activeMarker(markerId) {
    return this.data.markers.find(item => item.id === markerId)
  },

  /**
   * 渲染附近的位置
   */
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
          this.setData({
            areaPlaceList: res.result,
            loadFinished: true
          })
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
          this.setData({
            areaPlaceList: res.result,
            loadFinished: true
          })
        } else {
          wx.showToast({
            title: '附近没有小区',
            icon: 'none'
          })
        }
      }
    }
  },
  _setAreaMapData(data) {
    console.log('data', data)
    const tempData = []
    const [first, ...rest] = data
    if (data.length) {
      tempData.push({
        ...first,
        type: first.type === 'school' ? '1' : '2',
        name: first.title || first.name,
        placeId: first.id || first.placeId
      })
      rest.length && rest.map(item => {
        const { type, placeId } = item
        tempData.push({
          ...item,
          type: type === 'school' ? '1' : '2',
          id: placeId
        })
      })
    }
    this.setData({
      areaPlaceList: tempData,
      loadFinished: true
    })
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
    console.log(place)
    const tapMark = this.data.markers.find(item => item.id === markerId) || {}
    if (place) {
      tapMark.id = place.placeId
    }
    if (markerId === this.data.activeCoverId && this.data.markerType !== 'MARKER_AREA') {
      this.onOpenCard()
      return
    }
    if (this.data.markerType === 'MARKER_AREA') {
      // if (markerId !== -101 && tapMark.id) {
      //   wx.showToast({ title: '该区暂未开放', icon: 'none' })
      //   return
      // }

      this._getAreaInfoList({
        'area': this._getAreaNameById(markerId),
        'city': '',
        'province': '上海市',
        'type': 2,
        'year': new Date().getFullYear()
      })
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
            mapScale: 14,
            nearRes: nearRes.result
          })
        } else {
          this._setMarkerType('MARKER_AREA')
          wx.showToast({ title: type === 1 ? '该区暂无学校' : '暂无小区', icon: 'none' })
          return
        }
        // 设置地区名称
        this.setData({
          areaName: this._getAreaNameById(tapMark.id),
          areaPlaceList: nearRes.result.map(item => {
            return {
              ...item,
              type: type === 2 ? 'house' : 'school'
            }
          })
        })
        return
      }
    }

    // 点击学校, 把当前学校和查出来的对口小区合并在一起
    if ((this.data.markerType === 'MARKER_SCHOOL' || this.data.markerType === 'MARKER_HOUSE_SCHOOL') && tapMark.id) {
      const res = await schoolHouses(markerId)
      const { nearRes } = this.data
      const activePlace = nearRes.find(item => item.placeId === markerId)
      console.log(activePlace)
      if (res.success) {
        if (res.result && res.result.length) {
          const activeSchoolMarker = this._activeMarker(markerId) || place
          activeSchoolMarker.type = 'school'
          activeSchoolMarker.zIndex = 100
          const houseMarkers = res.result.map(item => {
            return {
              ...item,
              type: 'house'
            }
          })
          this._renderMarkers([...houseMarkers], activeSchoolMarker, !!place)
          this.setData({
            activeCoverId: markerId,
            matchPlaceList: [activeSchoolMarker, ...houseMarkers],
            stopUp: false,
            isSearchModel: false
          })
          this._setAreaMapData([activeSchoolMarker, ...houseMarkers])
          this.onOpenCard()
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
      const { nearRes } = this.data
      if (res.success) {
        if (res.result && res.result.length) {
          const activeHouseMarker = this._activeMarker(markerId) || place
          const activePlace = nearRes.find(item => item.placeId === markerId)
          console.log(activePlace)
          activeHouseMarker.type = 'house'
          activeHouseMarker.zIndex = 100
          const schoolMarkers = res.result.map(item => {
            return {
              ...item,
              type: 'school'
            }
          })
          this._renderMarkers([...schoolMarkers], activeHouseMarker, !!place)
          this.setData({ activeCoverId: markerId, matchPlaceList: [activeHouseMarker, ...schoolMarkers], stopUp: false, isSearchModel: false })
          this._setAreaMapData([activeHouseMarker, ...schoolMarkers])
          this.onOpenCard()
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
    console.log('1122', e)
    const { detail: { markerId }} = e
    this._renderPlace(markerId, '', 1)
  },
  onTapMarker(e) {
    console.log(e)
    // this.onOpenCard()
  },
  onRegionchange(e) {
    console.log(e)
    const { detail } = e
    const { centerLocation } = detail
    const { latitude, longitude } = centerLocation || {}
    const _this = this
    this.setData({
      currentLatitude: latitude,
      currentLongitude: longitude
    })
    console.log(e.causedBy)
    if (e.type === 'end' && (e.causedBy === 'drag' || e.causedBy === 'update')) {
      if (!_this._isRegionchangeQuery()) return
      if (!_this._isAreaMark()) {
        console.log(latitude, longitude)
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
            if (!_this._isRegionchangeQuery()) return
            _this._renderNearPlace({
              latitude,
              longitude
            })
          }
          if (scale <= 10) {
            _this._backtoArea()
            _this._setMarkerType('MARKER_AREA')
            _this.selectComponent('#customTopFilter').resetAll()
          }
        }
      })
    }
  },
  onClickTopSearch(data) {
    try {
      this.selectComponent('#customTopFilter').hideDropDown()
    } catch (error) {
      console.log(error)
    }
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
    this.setData({ isScrollY: false, showInfoTip: false, showTopFilter: true })
  },
  onOpenCard(isTop = false) {
    const customBottomCard = this.selectComponent('#customBottomCard')
    if (isTop) {
      customBottomCard.setTranslate(-wx.getSystemInfoSync().windowHeight + 100)
      this.setData({ isScrollY: true, showInfoTip: true })
    } else {
      customBottomCard.setTranslate(-this.data.bottomDistance)
      this.setData({ isScrollY: false, showInfoTip: true })
    }
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
    const { detail: { type, area, placeNature, placeType, areaActiveId }} = data
    // 重置了区域,回到各个区的界面
    if (areaActiveId === 0) {
      this._setMarkerType('MARKER_AREA')
      this._backtoArea()
      this._includePoints(this.data.markers)
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
    // this._setMarkerType('MARKER_AREA')
    this._renderPlace(areaActiveId, '', Number(type))
    this.getPlaceList()
    this.onOpenCard(true)
    this._getAreaInfoList({
      'area': this._getAreaNameById(areaActiveId),
      'city': '',
      'province': '上海市',
      'type': 2,
      'year': new Date().getFullYear()
    })
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
    // const { markerType } = this.data
    // if (markerType === 'MARKER_HOUSE_SCHOOL' || markerType === 'MARKER_SCHOOL_HOUSE') {
    //   return
    // }
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
      listLoading: true,
      isSearchModel: true
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
  },
  onCloseDropdown(e) {
    console.log(e)
  },
  // 工具栏
  showNearByPlace() {
    const { markerType, currentLatitude, currentLongitude } = this.data
    console.log(markerType)
    if (markerType === 'MARKER_HOUSE' || markerType === 'MARKER_SCHOOL') {
      return
    }
    if (markerType === 'MARKER_HOUSE_SCHOOL') {
      this.setData({
        markerType: 'MARKER_HOUSE'
      })
    }
    if (markerType === 'MARKER_SCHOOL_HOUSE') {
      this.setData({
        markerType: 'MARKER_SCHOOL'
      })
    }
    this._renderNearPlace({
      latitude: currentLatitude,
      longitude: currentLongitude
    })
  },
  onTapBackToOrigin() {
    const { markerType } = this.data
    if (markerType === 'MARKER_HOUSE_SCHOOL') {
      this.setData({
        markerType: 'MARKER_HOUSE'
      })
    }
    if (markerType === 'MARKER_SCHOOL_HOUSE') {
      this.setData({
        markerType: 'MARKER_SCHOOL'
      })
    }
    this.mapCtx.moveToLocation(this.latitude, this.longitude)
  },
  onResetAll() {
    console.log(1)
    // this.reloadThisPage()
    this._getAreaInfoList({
      'area': '',
      'city': '',
      'province': '上海市',
      'type': 1,
      'year': new Date().getFullYear()
    })
    this.setData({
      areaName: '上海市',
      areaPlaceList: [],
      stopUp: true
    })
    this.onOpenCard()
  },
  toFeedback() {
    wx.navigateTo({
      url: '/pages/main/message/index'
    })
  },
  // 全局可用
  reloadThisPage() {
    const currentPages = getCurrentPages()
    const lastRoute = currentPages[currentPages.length - 1].route
    const options = currentPages[currentPages.length - 1].options
    let optionsStr = ''
    Object.keys(options).forEach(key => {
      optionsStr += '?' + key + '=' + options[key]
    })
    wx.redirectTo({
      url: '/' + lastRoute + optionsStr
    })
  }
})
