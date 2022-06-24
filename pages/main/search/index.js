const { getViewHeight } = require('../../../utils/index')
const { placeList } = require('../../../api/school-map')
const searchParams = {
  pageNo: 1,
  pageSize: 15,
  pages: 0,
  list: [],
  searchLoading: false,
  loadFinished: false,
  loadError: false
}
const area = {
  area: '',
  city: '上海市',
  province: '上海市'
}
Page({
  data: {
    ...searchParams,
    ...area,
    scrollHeight: null,
    searchValue: '',
    historyList: []
  },
  onLoad() {
    this._setScrollHeight()
    this._getHistoryFromStorage()
  },
  onChangeSearch(e) {
    this._initSearch(e.detail)
  },
  onCancel() {
    this._backToPre()
  },
  onLoadMore() {
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
      this._loadList()
    }, 300)
  },
  // * 区域类型->MARKER_AREA
  // * 学校类型->MARKER_SCHOOL
  // * 小区类型->MARKER_HOUSE
  // * 小区对应学校类型->MARKER_HOUSE_SCHOOL
  // * 学校对应小区类型->MARKER_SCHOOL_HOUSE
  onClickListItem(e) {
    this._saveHistory()
    const prePage = this._getPrePage()
    const typeMap = {
      1: 'MARKER_SCHOOL',
      2: 'MARKER_HOUSE'
    }
    const { currentTarget: { dataset: { place }}} = e
    this._backToPre(() => {
      prePage.setData({
        mapScale: 14
      })
      prePage._setMarkerType(typeMap[place.type])
      prePage._renderPlace(place.placeId, place)
    })
  },
  onClickHistoryItem(e) {
    this._initSearch(e.currentTarget.dataset.value)
  },
  onRemoveHistroy() {
    const _this = this
    wx.showModal({
      title: '提示',
      content: '确认清空所有记录?',
      success(res) {
        if (res.confirm) {
          wx.removeStorage({
            key: 'historySearch',
            success() {
              _this.setData({
                historyList: []
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  onClear() {
    this.setData({
      searchValue: ''
    })
  },
  _setScrollHeight() {
    this.setData({
      scrollHeight: getViewHeight(-54)
    })
  },
  _initSearch(searchValue) {
    this.setData({
      ...searchParams,
      searchValue
    })
    if (searchValue) {
      this._loadList()
    }
  },
  _saveHistory() {
    const { historyList, searchValue } = this.data
    const list = historyList
    if (!list.includes(searchValue) && searchValue !== '') {
      list.unshift(searchValue)
    }
    this.setData({
      historyList: list
    })
    wx.setStorage({
      key: 'historySearch',
      data: list
    })
  },
  _getHistoryFromStorage() {
    const _this = this
    wx.getStorage({
      key: 'historySearch',
      success(res) {
        _this.setData({
          historyList: res.data
        })
      }
    })
  },
  async _loadList() {
    const { pageNo, pageSize, area, city, province, searchValue, list } = this.data
    this.setData({
      searchLoading: true
    })
    const res = await placeList({
      name: searchValue,
      area,
      city,
      province,
      pageNo,
      pageSize
    })
    if (res.success) {
      const { result } = res
      if (Array.isArray(result.records) && result.records.length) {
        this.setData({
          list: list.concat(result.records),
          searchLoading: false,
          pages: result.pages
        })
        if (result.records.length < pageSize) {
          this.setData({
            loadFinished: true
          })
        }
      } else {
        this.setData({ loadFinished: true, searchLoading: false })
      }
    }
  },
  _backToPre(callback) {
    setTimeout(() => {
      wx.navigateBack({
        success(res) {
          callback && callback(res)
        }
      })
    }, 100)
  },
  _getPrePage() {
    const pages = getCurrentPages()
    return pages[pages.length - 2]
  }
})
