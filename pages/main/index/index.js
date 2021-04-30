// const app = getApp()
import Notify from '../../../miniprogram_npm/@vant/weapp/notify/notify'
const windowHeight = wx.getSystemInfoSync().windowHeight // 屏幕的高度
const windowWidth = wx.getSystemInfoSync().windowWidth // 屏幕的宽度
const ratio = 750 / windowWidth
const { searchSchoolOrHouse, qqMapTranslate, getSchoolDetail, getHouseDetail, getSchoolByHouseId } = require('../../../api/school-map')
const { translateQQLocation } = require('../../../utils/index')
Page({
  data: {
    latitude: 31.079337,
    longitude: 121.592369,
    tabsShow: true,
    searchType: '',
    searchShow: false,
    searchFocus: false,
    duration: 300,
    position: 'center',
    round: false,
    overlay: true,
    searchValue: '',
    scroll_height: '',
    pageNo: 1,
    pageSize: 15,
    currentPage: 1,
    list: [],
    pages: 0,
    searchLoading: false,
    loadFinished: false,
    loadError: false,
    houses: [],
    schoolName: '',
    schoolAddress: '',
    showOverlay: false,
    colors: ['#ee0a24'],
    polygons: [],
    markers: [],
    includePoints: [],
    customCalloutMarker: [],
    mapScale: 14,
    list2: [],
    activeName: '',
    markers2: []
  },
  onLoad() {
  },
  onUnload() {
  },
  onShow() {
  },
  onReady() {
    this.mapCtx = wx.createMapContext('myMap')
    this.setCurPos()
    this.setData({
      scroll_height: (windowHeight - 60) * ratio
    })
  },
  setCurPos() {
    const self = this
    wx.getLocation({
      altitude: true,
      isHighAccuracy: true,
      success(res) {
        const { longitude, latitude } = res
        self.setData({
          longitude: longitude,
          latitude: latitude
        })
      }
    })
  },
  showSearch(e) {
    const { dataset: { type }} = e.currentTarget
    this.setData({ searchType: type, searchShow: true, tabsShow: false, searchFocus: true })
    Notify.clear()
  },

  // search-page
  onAfterLeave(res) {
    this.initSearch()
    this.setData({ searchShow: false, tabsShow: true })
  },
  onSearch() {
    const { searchType } = this.data
    this.initSearch()
    this.getData('loadMore', searchType)
  },
  onChangeSearch(e) {
    this.setData({
      searchValue: e.detail
    })
    this.onSearch()
  },
  onCancel() {
    this.initSearch()
    this.setData({ searchShow: false, tabsShow: true })
  },
  initSearch() {
    this.setData({
      pageNo: 1,
      pageSize: 15,
      currentPage: 1,
      list: [],
      pages: 0,
      searchLoading: false,
      loadFinished: false
    })
  },
  // 获取列表数据
  getData(handleType, searchType) {
    const { pageSize, searchValue } = this.data
    if (!searchValue) {
      return
    }
    this.setData({
      pageNo: handleType === 'init' ? 1 : this.data.pageNo,
      searchLoading: true
    })
    // 发送请求
    searchSchoolOrHouse({
      name: searchValue,
      area: '浦东新区',
      city: '上海市',
      province: '上海市',
      pageNo: this.data.currentPage,
      pageSize
    }, searchType).then(res => {
      if (!res.success) {
        this.setData({ loadError: true })
        return
      }
      const { result } = res
      const pageData = this.data.list
      if (!result.records.length) {
        this.setData({ loadFinished: true, searchLoading: false })
        return
      }
      this.setData({
        list: handleType === 'init' ? result.records : pageData.concat(result.records),
        searchLoading: false,
        pages: result.pages,
        loadFinished: result.records.length < this.data.pageSize
      })
    }).catch(err => {
      console.log(err)
    })
  },
  // 上拉加载更多
  loadMore() {
    const self = this
    // 当前页是最后一页
    if (self.data.currentPage === self.data.pages) {
      this.setData({
        loadFinished: true
      })
      return
    }
    setTimeout(function() {
      let tempCurrentPage = self.data.currentPage
      tempCurrentPage = tempCurrentPage + 1
      self.setData({
        currentPage: tempCurrentPage
      })
      const { searchType } = self.data
      self.getData('loadMore', searchType)
    }, 300)
  },
  onSelectItem(e) {
    const locId = e.currentTarget.id
    this.renderMap(locId)
  },
  // 选择
  async renderMap(locId) {
    // const locId = e.currentTarget.id
    const { searchType } = this.data
    if (searchType === 'SCHOOL' || searchType === 'HOUSE') {
      wx.showLoading({
        title: '加载中...'
      })
      const markers = []
      const points = []
      const detailRes = searchType === 'SCHOOL' ? await getSchoolDetail({ id: locId }) : await getHouseDetail({ id: locId })
      const list = searchType === 'SCHOOL' ? detailRes.result.houses : detailRes.result.schools
      const { lat, lng, id, name, address, tags } = detailRes.result

      // 所搜的学校或者小区
      const translateRes = await qqMapTranslate({
        locations: `${lat},${lng}`
      })
      const schoolOrHouseLocation = {
        latitude: translateRes.locations[0].lat,
        longitude: translateRes.locations[0].lng
      }

      // 拿到学校或者小区列表,组装makers
      Array.isArray(list) && list.forEach(item => {
        const marker = {}
        const { latitude, longitude } = translateQQLocation(item.qqLocation)
        marker.id = item.id
        marker.latitude = latitude
        marker.longitude = longitude
        marker.width = 1
        marker.height = 1
        marker.iconPath = '../image/pin.png'
        marker.callout = {
          content: item.tags === '住宅区' || item.tags === null ? `${item.name}` : `${item.name}(${item.tags})`,
          color: '#ffffff',
          fontSize: 14,
          borderWidth: 1,
          borderRadius: 10,
          borderColor: '#07c160',
          bgColor: '#07c160',
          padding: 4,
          display: 'ALWAYS',
          textAlign: 'center'
        }
        markers.push(marker)
      })
      // 所搜的学校或者小区的maker
      const activeMaker = {
        id: id,
        latitude: schoolOrHouseLocation.latitude,
        longitude: schoolOrHouseLocation.longitude,
        width: 1,
        height: 1,
        iconPath: '../image/pin.png',
        callout: {
          content: tags === '住宅区' || tags === null ? `${name}` : `${name}(${tags})`,
          color: '#ffffff',
          fontSize: 14,
          borderWidth: 1,
          borderRadius: 10,
          borderColor: '#ee0a24',
          bgColor: '#ee0a24',
          padding: 4,
          display: 'ALWAYS',
          textAlign: 'center'
        }
      }
      const customCallout = {
        id: 999999,
        latitude: schoolOrHouseLocation.latitude,
        longitude: schoolOrHouseLocation.longitude,
        width: 1,
        height: 1,
        count: markers.length,
        iconPath: '../image/pin.png',
        customCallout: {
          anchorY: 0,
          anchorX: 0,
          display: 'ALWAYS'
        }
      }
      markers.push(activeMaker)
      markers.forEach(item => {
        const { latitude, longitude } = item
        points.push({
          latitude,
          longitude
        })
      })
      if (markers.length < 20) {
        this.setData({ searchShow: false, customCalloutMarker: [], tabsShow: true, houses: list, schoolName: name, schoolAddress: address, markers })
      } else {
        this.setData({ markers2: markers, searchShow: false, customCalloutMarker: [customCallout], tabsShow: true, houses: list, schoolName: name, schoolAddress: address, markers: [customCallout] })
      }
      if (searchType === 'SCHOOL') {
        this.mapCtx.includePoints({ points, padding: [20, 40, 20, 40] })
      }

      this.mapCtx.moveToLocation(schoolOrHouseLocation)
      wx.hideLoading()
      Notify({
        color: '#fff',
        background: 'rgba(1,1,1,.7)',
        type: 'success',
        message: tags === '住宅区' || tags === null ? `搜索结果-${name}` : `搜索结果-${name}(${tags})`,
        duration: 0
      })
    }
  },
  noop() {
    this.setData({ showOverlay: true })
  },
  showHouses() {
    this.setData({ showOverlay: true })
  },
  hideHouses() {
    console.log(this.data.showOverlay)
    this.setData({ showOverlay: false })
  },
  async bindcallouttap(e) {
    console.log(this)
    const { markerId } = e.detail
    // this.renderMap(markerId)
    if (markerId === 999999) {
      console.log(this.data.markers2)
      this.setData({ customCalloutMarker: [], markers: this.data.markers2 })
    }
  },
  bindmarkertap(e) {
    console.log(e)
  },
  regionchange(e) {
    console.log(e)
  }
})
