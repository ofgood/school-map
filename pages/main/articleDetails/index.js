const { setNavigationBarTitle } = require('../../../utils/index')
const { newsDetail } = require('../../../api/school-map.js')
const { imgSrc } = require('../../../api/school-map')
const { default: { baseUrl }} = require('../../../request/defaults')
// pages/main/list/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    details: {},
    imgList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { id } = options
    this._getDetail(id)
    setNavigationBarTitle('')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(data) {

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
  /**
   * 获取文章详情
   * @param {string} id
   */
  async _getDetail(id) {
    const res = await newsDetail({ id })
    const { result } = res
    this.setData({
      details: result,
      imgList: this._generateImgList(result.imageList)
    })
  },
  /**
   * 下载文件
   * @param {string} fileId
   */
  downloadFile(fileId) {
    const _this = this
    wx.showLoading({
      title: '下载中.....',
      mask: true
    })
    console.log(_this._generateSrc(fileId))
    wx.downloadFile({
      url: _this._generateSrc(fileId),
      success: function(res) {
        wx.openDocument({
          filePath: res.tempFilePath,
          success: function(res) {
            wx.hideLoading()
          }
        })
      }

    })
  },
  _generateSrc(fileId) {
    return `${baseUrl}${imgSrc}${fileId}`
  },
  _generateImgList(list) {
    if (list && list.length) {
      return list.map(item => `${baseUrl}${imgSrc}${item.fileId}`)
    } else {
      return []
    }
  },
  onClickLink() {
    const { details } = this.data
    console.log(details)
    wx.navigateTo({
      url: `/pages/main/webview/index?url=${details.link}`
    })
  },
  onClickFileItem(data) {
    const fileId = data?.currentTarget?.dataset?.file?.fileId
    this.downloadFile(fileId)
  }
})
