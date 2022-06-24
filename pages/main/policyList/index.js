const {
  setNavigationBarTitle
} = require('../../../utils/index')
// pages/main/list/index.js
const { policyLis, scheduleAllEvent } = require('../../../api/school-map')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNo: 1,
    pageSize: 15,
    pages: 0,
    list: [],
    searchLoading: false,
    loadFinished: false,
    loadError: false,
    area: '',
    city: '上海市',
    province: '上海市',
    type: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    const { area, type } = options
    this.setData({
      area,
      type
    })
    setNavigationBarTitle(this.data.type === 'policy' ? `${area}政策列表` : `${area}日程列表`)
    this._loadList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  onClickLeft() {
    wx.showToast({ title: '点击返回', icon: 'none' })
  },
  onClickRight() {
    wx.showToast({ title: '点击按钮', icon: 'none' })
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
  async _loadList() {
    const { pageNo, pageSize, area, city, province, list } = this.data
    this.setData({
      searchLoading: true
    })
    let res = ''
    if (this.data.type === 'policy') {
      res = await policyLis({
        area,
        city,
        province,
        pageNo,
        pageSize
      })
    } else {
      res = await scheduleAllEvent({
        area,
        city,
        province,
        pageNo,
        pageSize
      })
    }

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
  },
  onClickListItem(data) {
    console.log(data)
    const id = data.currentTarget?.dataset?.place?.id
    wx.navigateTo({
      url: `/pages/main/articleDetails/index?id=${id}`
    })
  }
})
