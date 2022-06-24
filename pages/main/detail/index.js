/** API */
const {
  houseDetail,
  schoolDetail,
  imgSrc
} = require('../../../api/school-map')
const { default: { baseUrl }} = require('../../../request/defaults')
Page({
  onShareAppMessage() {
    return {
      title: 'swiper',
      path: 'page/component/pages/swiper/swiper'
    }
  },
  onLoad(data) {
    this._getDetail(data)
    console.log(baseUrl)
  },
  data: {
    background: ['https://s3.bmp.ovh/imgs/2021/12/7a6a9122c36c5ea3.png'],
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    detail: {},
    type: ''
  },

  changeIndicatorDots() {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },

  changeAutoplay() {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },

  intervalChange(e) {
    this.setData({
      interval: e.detail.value
    })
  },

  durationChange(e) {
    this.setData({
      duration: e.detail.value
    })
  },
  async _getDetail({ type, id }) {
    this.setData({ type })
    try {
      let res = {}
      if (type === '1') {
        res = await schoolDetail({
          id
        })
      } else if (type === '2') {
        res = await houseDetail({
          id
        })
      }
      if (res.success) {
        this.setData({
          detail: res.result
        })
        if (res.result.imageList && res.result.imageList.length) {
          this.setData({
            background: this._generateImgSrc(res.result.imageList)
          })
        }
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    } catch (error) {
      wx.showToast({
        title: '出错了~~',
        icon: 'none'
      })
    }
  },
  _generateImgSrc(imageList) {
    return imageList.map(item => `${baseUrl}${imgSrc}${item.fileId}`)
  },
  /* 获取当前页url*/
  getCurrentPageUrl() {
    const pages = getCurrentPages() // 获取加载的页面
    const currentPage = pages[pages.length - 1] // 获取当前页面的对象
    const url = currentPage.route // 当前页面url
    return url
  },
  scroll() {

  }
})
