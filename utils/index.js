/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || +time <= 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

/**
 * 对象深度克隆
 * @param {Object|Array} target
 */
export function deepClone(obj) {
  var newObj = obj instanceof Array ? [] : {}
  for (var item in obj) {
    var temple = typeof obj[item] === 'object' && obj[item] !== null ? deepClone(obj[item]) : obj[item]
    newObj[item] = temple
  }
  return newObj
}

/**
 * tabbar焦点控制
 * @param {string|number} index
 */
export function initTabActive(index) {
  if (typeof this.getTabBar === 'function' && this.getTabBar()) {
    this.getTabBar().setData({
      active: index
    })
  }
}

/** base64转本地图片
 * @param {string} base64
 */
export function base64toSrc(base64) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager()
    const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64) || []
    // 随机定义路径名称
    var hash = new Date().getTime()
    if (!format) {
      reject('不存在base64格式文件信息')
      return
    }
    const filePath = `${wx.env.USER_DATA_PATH}/${hash}.${format}`
    const buffer = wx.base64ToArrayBuffer(bodyData)
    console.log(123123)
    // 将base64图片写入
    fs.writeFile({
      filePath,
      data: buffer,
      encoding: 'binary',
      success: () => {
        resolve(filePath)
      }
    })
  })
}

/**
 * 返回头部导航高度 px
 */
export function getNavbarHeight() {
  const statusBarHeight = wx.getSystemInfoSync().statusBarHeight
  const navHeight = 46 + statusBarHeight
  return navHeight
}

/**
 * 从数组中随机取出一项
 * @param {*} arr
 * @returns
 */
export function getRandomItemFromArr(arr) {
  const res = arr[Math.floor((Math.random() * arr.length))]
  return res
}

/**
 * 转过后的坐标,转换为 polygon 中的 points
 * @param {} locations
 * @return {}
 */
export function locationsToPoints(locations) {
  const points = []
  if (Array.isArray(locations) && locations.length) {
    locations.forEach(item => {
      points.push({
        latitude: item.lat,
        longitude: item.lng
      })
    })
  }
  return points
}

/**
 * 转换后端传过来的qq地图坐标
 * @param {} location
 * @return {}
 */
export function translateQQLocation(location) {
  const locationObj = {}
  if (typeof location === 'string' && location.includes(',')) {
    const tempArr = location.split(',')
    locationObj.latitude = tempArr[0]
    locationObj.longitude = tempArr[1]
  }
  return locationObj
}

/**
 * 计算区域高度 px 转 rpx
 * @param {string} height
 * @returns
 */
export function getViewHeight(height) {
  const windowHeight = wx.getSystemInfoSync().windowHeight // 屏幕的高度
  const windowWidth = wx.getSystemInfoSync().windowWidth // 屏幕的宽度
  const ratio = 750 / windowWidth
  return (windowHeight + height) * ratio
}

/**
 * 设置页面标题
 * @param {*} titleText
 */
export function setNavigationBarTitle(titleText) {
  wx.setNavigationBarTitle({
    title: titleText
  })
}

/**
 * 格式化列表转化为markers
 * @param {*} records
 */
export function formatRecordsToMarkers(records) {
  console.log('records', records)
  const res = []
  if (Array.isArray(records)) {
    for (let i = 0; i < records.length; i++) {
      const { name, placeId, qqLocation, type } = records[i]
      if (!qqLocation) {
        console.log(name)
        continue
      }
      const [latitude, longitude] = qqLocation.split(',')
      latitude && longitude && res.push({
        id: placeId,
        latitude,
        longitude,
        width: 1,
        height: 1,
        title: name,
        ...records[i],
        iconPath: '../image/transparent.png',
        callout: type === 'school' ? {
          content: name,
          color: '#0092B6',
          bgColor: '#fff',
          fontSize: 12,
          borderWidth: 1,
          borderRadius: 100,
          borderColor: '#0092B6',
          display: 'ALWAYS',
          padding: 6
        } : {
          content: name,
          color: '#333',
          bgColor: '#fff',
          fontSize: 12,
          borderWidth: 1,
          borderRadius: 3,
          borderColor: '#333333',
          display: 'ALWAYS',
          padding: 6
        }
      })
    }
  }
  return res
}

/**
 * 从marker中取出需要include的marker
 * @param {*} markers
 */

export function getIncludePointsFromMarkers(markers) {
  const res = []
  markers.forEach(item => {
    const { latitude, longitude } = item
    res.push({
      latitude,
      longitude
    })
  })
  return res
}

/**
 * 格式化字典数据
 * @param {[{[key]: any}]} dicList
 */

export function formatDic(dicList) {
  const res = dicList.map(({ value, title, status }) => {
    return {
      value,
      label: title,
      status
    }
  })
  return res
}

/**
 * 处理promise.all 防止其中一个调用失败而导致结果不能返回
 * @param {[{key:string,promise:promise}]} promiseList
 */
export function handlePromiseAll(promiseList) {
  return promiseList.map(({ key, promise }) =>
    promise.then((res) => ({ success: true, key, res, status: 'ok' }), (err) => ({ success: false, key, res: err, status: 'not ok' }))
  )
}
