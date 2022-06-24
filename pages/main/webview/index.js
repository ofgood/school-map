// index.js
Page({
  data: {
    url: 'https://test.com'
  },
  onLoad: function(options) {
    if (options.url) {
      if (options.url.includes('|')) {
        console.log(`${options.url.split('|')[0]}://${options.url.split('|')[1]}`)
        this.setData({ url: `${options.url.split('|')[0]}://${options.url.split('|')[1]}` })
      } else {
        this.setData({ url: options.url })
      }
    } else {
      wx.navigateBack({ delta: 2 })
    }
  }
})
