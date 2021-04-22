// const app = getApp()
const windowHeight = wx.getSystemInfoSync().windowHeight // 屏幕的高度
const windowWidth = wx.getSystemInfoSync().windowWidth // 屏幕的宽度
const ratio = 750 / windowWidth
const { searchSchoolOrHouse, getSchoolDetail, qqMapTranslate, getHouseDetail } = require('../../../api/school-map')
const { getRandomItemFromArr } = require('../../../utils/index')
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
    pageSize: 10,
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
    mapScale: 16
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
        console.log(res)
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
  },
  onCancel() {
    this.initSearch()
    this.setData({ searchShow: false, tabsShow: true })
  },
  initSearch() {
    this.setData({
      pageNo: 1,
      pageSize: 10,
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
  // 选择
  async onSelectItem(e) {
    const { currentTarget: { id }} = e
    const { searchType } = this.data
    if (searchType === 'SCHOOL' || searchType === 'HOUSE') {
      wx.showLoading({
        title: '加载中...'
      })
      const res = searchType === 'SCHOOL' ? await getSchoolDetail({ id: 1 }) : await getHouseDetail({ id: 1 })
      const list = searchType === 'SCHOOL' ? res.result.houses : res.result.schools
      const { lat, lng, id, name, address } = res.result
      const markers = []
      const points = []
      const translateRes = await qqMapTranslate({
        locations: `${lat},${lng}`
      })
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
        const res = await qqMapTranslate({
          locations: `${element.lat},${element.lng}`
        })
        const { lat = 31.22114, lng = 121.54409 } = res.locations && res.locations[0] || {}
        element.latitude = lat
        element.longitude = lng
        // element.iconPath = '../image/location.png'
        markers.push(element)
      }
      markers.forEach(item => {
        const { latitude, longitude } = item
        points.push({
          latitude,
          longitude
        })
      })
      this.mapCtx.addMarkers({
        markers
      })
      this.mapCtx.includePoints({
        points
      })
      this.mapCtx.moveToLocation({
        latitude: translateRes.locations[0].lat,
        longitude: translateRes.locations[0].lng
      })
      this.mapCtx.addMarkers({
        markers: [
          {
            id: 99,
            latitude: translateRes.locations[0].lat,
            longitude: translateRes.locations[0].lng,
            iconPath: '../image/pin.png'
          }
        ]
      })
      this.setData({ searchShow: false, tabsShow: true, houses: list, schoolName: name, schoolAddress: address, mapScale: 16 })
      wx.hideLoading()
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
  getRandomColor() {
    return getRandomItemFromArr(this.data.colors)
  }
})
