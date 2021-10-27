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
const PDXQ = {
  latitude: 31.221522,
  longitude: 121.544374
}
Page({
  data: {
    cardOffsetTop: wx.getSystemInfoSync().windowHeight - 300,
    cardHeight: '300px',
    latitude: 32.079337,
    longitude: 121.592369,
    tabsShow: true,
    showTopFilter: true,
    bottomDistance: 220,
    isScrollY: false,
    scrollHeight: '',

    duration: 300,
    position: 'center',
    round: false,

    houses: [],
    schoolName: '',
    schoolAddress: '',

    areaTitle: '区域',
    mainActiveIndex: 0,
    activeId: 101,

    polygons: [],
    markers: [{
      id: 112,
      latitude: PDXQ.latitude,
      longitude: PDXQ.longitude,
      width: 1,
      height: 1,
      count: 2,
      name: '浦东',
      iconPath: '../image/pin.png',
      customCallout: {
        anchorY: 0,
        anchorX: 0,
        display: 'ALWAYS'
      }
    },
    {
      id: 123333,
      latitude: 31.231641,
      longitude: 121.483979,
      width: 1,
      height: 1,
      count: 2,
      name: '黄浦',
      iconPath: '../image/pin.png',
      customCallout: {
        anchorY: 0,
        anchorX: 0,
        display: 'ALWAYS'
      }
    }],
    includePoints: [],
    customCalloutMarker: [
      {
        id: 112,
        latitude: PDXQ.latitude,
        longitude: PDXQ.longitude,
        width: 1,
        height: 1,
        count: 2,
        name: '上海市浦东新区人名政府',
        iconPath: '../image/pin.png',
        customCallout: {
          anchorY: 0,
          anchorX: 0,
          display: 'ALWAYS'
        }
      },
      {
        id: 123333,
        latitude: 31.231641,
        longitude: 121.483979,
        width: 1,
        height: 1,
        count: 2,
        name: '黄浦',
        iconPath: '../image/pin.png',
        customCallout: {
          anchorY: 0,
          anchorX: 0,
          display: 'ALWAYS'
        }
      }
    ],
    mapScale: 11,
    list2: [],
    activeName: '',
    markers2: [],

    showPlaceCard: false,
    showNearBy: true,
    placeInfo: {
      desc: '',
      title: '',
      imgSrc: '',
      price: '',
      plate: '',
      buildDate: '',
      tags: [],
      placeType: '',
      hasImg: false,
      takingBg: '',
      takingIcon: ''
    },
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
    distance: 1,
    queryPlaceType: 'school',
    showOverlay: false,
    currentLatitude: '',
    currentLongitude: ''
  },
  onLoad() {
  },
  onUnload() {
  },
  onShow() {
  },
  async onReady() {
    this.setScrollViewHeight()
    // 创建地图实例
    this.mapCtx = wx.createMapContext('myMap')
    // 初始化中心点
    await this.initCenter()
    const initPos = await this.getCurPos()
    const { longitude, latitude } = initPos
    const { distance, queryPlaceType } = this.data
    // this.initNearby({
    //   latitude,
    //   longitude,
    //   distance,
    //   queryPlaceType
    // })
    // 设置窗口高度
  },
  setScrollViewHeight() {
    const customBottomCard = this.selectComponent('#customBottomCard');
    this.setData({
      scrollHeight: customBottomCard.__data__.wrapHeight + 'px'
    })
  },
  // 获取当前位置
  getCurPos() {
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
  // 设置中心点
  setCenter(longitude, latitude) {
    this.setData({
      longitude: longitude,
      latitude: latitude
    })
  },
  // 百度转qq坐标
  async getActiveLocation(lat, lng) {
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
  async initCenter() {
    const initPos = await this.getCurPos()
    const { longitude, latitude } = initPos
    if (longitude && latitude) {
      this.setCenter(longitude, latitude)
    }
  },
  onClickTopSearch(data) {
    wx.navigateTo({
      url: '/pages/main/search/index'
    })
  },
  showList() {
    // wx.navigateTo({
    //   url: '/pages/main/search/index'
    // })
  },
  // 选择
  async renderMap(locId, placeType, isCallouttap = false) {
    wx.showLoading({
      title: '加载中...'
    })

    const placeDetailRes = await this.getPlaceDetailByIdAndType(locId, placeType)
    const { detailRes, list } = placeDetailRes
    const { lat, lng, id, name, address, type } = detailRes

    // 初始化卡片信息
    this.initPlaceInfo(detailRes, placeType)

    // 百度坐标转qq地图
    const activeLocation = await this.getActiveLocation(lat, lng)
    const { latitude, longitude } = activeLocation
    // 拿到列表,组装makers
    const markers = this.getMarkers(list, placeType)

    // 所搜的学校或者小区的maker
    const activeMarker = {
      id: id,
      type: placeType,
      latitude: latitude,
      longitude: longitude,
      width: 1,
      height: 1,
      iconPath: '../image/pin.png',
      callout: {
        content: name,
        color: '#ffffff',
        fontSize: 12,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#0092B6',
        bgColor: '#0092B6',
        padding: 6,
        display: 'ALWAYS',
        textAlign: 'center'
      }
    }
    const customCallout = {
      id: 9999999,
      latitude: latitude,
      longitude: longitude,
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
    markers.push(activeMarker)
    if (markers.length < 21 || isCallouttap) {
      this.setData({
        searchShow: false,
        tabsShow: true,
        customCalloutMarker: [],
        houses: list,
        schoolName: name,
        schoolAddress: address,
        markers
      })
    } else {
      this.setData({
        markers2: markers,
        activeName: name,
        searchShow: false,
        tabsShow: true,
        customCalloutMarker: [customCallout],
        houses: list,
        schoolName: name,
        schoolAddress: address,
        markers: [customCallout]
      })
    }
    if (type === 1) {
      this.mapCtx.includePoints({ points: this.getPoints(markers), padding: [20, 100, 20, 100] })
    }
    this.mapCtx.moveToLocation(activeLocation)
    wx.hideLoading()
  },
  onSelectItem(e) {
    const locId = e.currentTarget.id
    const { type } = e.currentTarget.dataset.place // type--2 对应小区,type--1 对应学校
    this.setData({
      showNearBy: false
    })
    wx.nextTick(() => {
      this.renderMap(locId, type)
    })
  },

  async getPlaceDetailByIdAndType(id, type) {
    let detailRes = {}
    let list = []
    switch (type) {
      case 1:
        detailRes = await getSchoolDetailById({ id })
        list = detailRes.result.houses
        break
      case 2:
        detailRes = await getHouseDetailById({ id })
        list = detailRes.result.schools
        break
      default:
        break
    }
    return {
      detailRes: detailRes.result,
      list
    }
  },
  getMarkers(list, placeType, isNearby) {
    const markers = []
    Array.isArray(list) && list.forEach(item => {
      const marker = {}
      const { latitude, longitude } = translateQQLocation(item.qqLocation)
      marker.id = item.placeId
      marker.latitude = latitude
      marker.longitude = longitude
      marker.width = 1
      marker.height = 1
      marker.iconPath = '../image/pin.png'
      marker.callout = {
        content: item.name,
        color: '#0092B6',
        fontSize: 12,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#0092B6',
        bgColor: '#ffffff',
        padding: 6,
        display: 'ALWAYS',
        textAlign: 'center'
      }
      if (marker.latitude && marker.longitude) {
        markers.push(marker)
      }
      if (!isNearby) {
        marker.type = placeType === 1 ? 2 : 1
      } else {
        marker.type = placeType
      }
    })
    return markers
  },
  getPoints(markers) {
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
  showHouses() {
    // this.setData({ showOverlay: true })
  },
  hideHouses() {
    this.setData({ showOverlay: false })
  },
  async bindcallouttap(e) {
    // const { markerId } = e.detail
    // this.setData({
    //   showNearBy: false
    // })
    // if (markerId === 9999999) {
    //   this.setData({ customCalloutMarker: [], markers: this.data.markers2 })
    //   return
    // }
    // const activeMarker = this.getActiveMarkerById(markerId)
    // const { type } = activeMarker
    // await this.renderMap(markerId, type, true)
    // this.showPlaceCard()
    this.onOpenCard()
  },
  getActiveMarkerById(markerId) {
    let result = {}
    this.data.markers.forEach(item => {
      if (item.id === markerId) {
        result = { ...item }
      }
    })
    return result
  },
  bindmarkertap(e) {
    console.log(e)
    // this.onOpenCard()
  },
  regionchange(e) {
    if (this.data.showNearBy && (e.type === 'end')) {
      const { detail } = e
      const { distance, queryPlaceType } = this.data
      const { centerLocation } = detail
      const { latitude, longitude } = centerLocation
      this.setData({
        currentLatitude: latitude,
        currentLongitude: longitude
      })
      // this.initNearby({
      //   latitude,
      //   longitude,
      //   distance,
      //   queryPlaceType
      // })
    }
  },

  showNearByPlace() {
    const _this = this
    _this.setData({
      showNearBy: true
    })
    const { distance, queryPlaceType } = _this.data
    _this.mapCtx.getCenterLocation({
      success(res) {
        const { latitude, longitude } = res
        _this.initNearby({
          latitude,
          longitude,
          distance,
          queryPlaceType
        })
      }
    })
  },

  onClosePlaceCard() {
    this.closePlaceCard()
  },
  showPlaceCard() {
    this.setData({
      showPlaceCard: true
    })
  },
  closePlaceCard() {
    this.setData({
      showPlaceCard: false
    })
  },
  initPlaceInfo(activePlace, placeType) {
    console.log(activePlace)
    let placeTags = []
    let placeNature
    let schoolTypeText
    const { nature, address, name, city, area, price, plate, buildDate, imageUrl, type } = activePlace
    const hasImg = !!imageUrl
    switch (placeType) {
      case 1:
        placeNature = schoolNatrue[nature]
        schoolTypeText = schoolType[type]
        break
      case 2:
        placeNature = houseNatrue[nature]
        schoolTypeText = ''
        break
      default:
        break
    }
    placeTags = [placeNature, schoolTypeText].filter(item => item)
    this.setData({
      placeInfo: {
        desc: city + area + address,
        title: name,
        imgSrc: imageUrl,
        tags: placeTags,
        price: price,
        plate,
        buildDate,
        placeType: placeType,
        hasImg,
        takingBg: '',
        takingIcon: '../image/camera.png'
      }
    })
  },
  async getNearbySchool(nearbyData) {
    const res = await getSchoolNearby(nearbyData)
    return res
  },
  async getNearyHouse(nearbyData) {
    const res = await getHouseNearby(nearbyData)
    return res
  },
  async getNearbyHouse(nearbyData) {
    const res = await getHouseNearby(nearbyData)
    return res
  },
  async initNearby(options) {
    const { latitude, longitude, distance = 1, queryPlaceType = 'school' } = options
    const coords = `${longitude},${latitude}`
    const baiduPos = await baiduMapTranslate({ coords })
    const baiduPosresult = baiduPos.result[0]
    const { result } = queryPlaceType === 'school' ? await this.getNearbySchool({
      distance,
      longitude: baiduPosresult.x,
      latitude: baiduPosresult.y
    }) : await this.getNearbyHouse({
      distance,
      longitude: baiduPosresult.x,
      latitude: baiduPosresult.y
    })
    const markers = this.getMarkers(result, 1, true)
    this.setData({
      searchShow: false,
      showPlaceCard: false,
      tabsShow: true,
      customCalloutMarker: [],
      houses: result,
      markers
    })
  },
  backToOrigin() {
    this.mapCtx.moveToLocation(this.latitude, this.longitude)
    this.setData({
      showNearBy: true
    })
    this.onReady()
  },
  onChangeDropdown(e) {
    console.log(e)
    const { currentTarget, detail } = e
    const { id } = currentTarget
    const { currentLatitude, currentLongitude, distance, queryPlaceType } = this.data
    switch (id) {
      case 'distanceDropdown':
        this.setData({
          distance: detail
        })
        this.initNearby(
          {
            distance: detail,
            longitude: currentLongitude,
            latitude: currentLatitude,
            queryPlaceType
          }
        )
        break
      case 'placeTypeDropdown':
        this.setData({
          queryPlaceType: detail
        })
        this.initNearby(
          {
            distance,
            longitude: currentLongitude,
            latitude: currentLatitude,
            queryPlaceType: detail
          }
        )
        break
      default:
        break
    }
  },
  onChangeDistanceDropdown(e) {
    const { detail } = e
    const { currentLatitude, currentLongitude, queryPlaceType } = this.data
    this.setData({
      distance: detail
    })
    this.initNearby(
      {
        distance: detail,
        longitude: currentLongitude,
        latitude: currentLatitude,
        queryPlaceType
      }
    )
  },
  onChangePlaceTypeDropdown(e) {
    const { detail } = e
    const { currentLatitude, currentLongitude, distance } = this.data
    this.setData({
      queryPlaceType: detail
    })
    this.initNearby(
      {
        distance,
        longitude: currentLongitude,
        latitude: currentLatitude,
        queryPlaceType: detail
      }
    )
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
  }
})
