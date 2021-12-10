export default function wxRequest(config) {
  if (config.showLoading) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
  }
  return new Promise((resolve, reject) => {
    wx.request({
      ...config,
      success(res) {
        const {
          resolveWrap,
          rejectWrap,
          transformResponse,
          validateStatus
        } = config
        if ((validateStatus && validateStatus(res)) || ifSuccess(res)) {
          // eslint-disable-next-line no-underscore-dangle
          const _resolve = resolveWrap ? resolveWrap(res) : res
          return resolve(transformResponse ? transformResponse(_resolve) : _resolve)
        }
        return reject(rejectWrap ? rejectWrap(res) : res)
      },
      fail(res) {
        const { rejectWrap } = config
        reject(rejectWrap ? rejectWrap(res) : res)
      },
      complete() {
        wx.hideLoading()
      }
    })
  })
}

function ifSuccess(res) {
  return /^2/.test(res.statusCode.toString()) && res.data.errcode === 0
}
