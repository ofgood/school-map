Component({
  options: {
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    pid: {
      type: Number,
      value: 0,
      observer(newVal) {
        if (newVal) {
          this.setData({
            animate: true
          }, () => {
            this.setData({
              translateX: 0,
              translateY: 0
            })
          })
        }
      }
    },
    bottomDistance: {
      type: Number,
      value: -200
    },
    triggerDistance: {
      type: Number,
      value: 50
    },
    stopUp: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    translateX: 0,
    animate: false,
    wrapHeight: wx.getSystemInfoSync().windowHeight - 20,
    winHeight: wx.getSystemInfoSync().windowHeight,
    touchStartY: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 处理touchstart事件
     */
    handleTouchStart(e) {
      // touch事件初始时，组件禁掉transition动画
      this.setData({
        animate: false
      }, () => {
        this.touchStartX = e.touches[0].pageX
        this.touchStartY = e.touches[0].pageY
        this.startY = this.data.translateY
        this.direction = null // 记录手指滑动方向 X:左右滑动； Y:上下滑动
      })
    },

    /**
     * 处理touchmove事件
     */
    handleTouchMove: function(e) {
      if (this.data.stopUp) {
        return
      }
      const { bottomDistance } = this.data
      this.touchMoveX = e.touches[0].pageX
      this.touchMoveY = e.touches[0].pageY
      this.moveX = this.touchMoveX - this.touchStartX
      this.moveY = this.touchMoveY - this.touchStartY
      // 左右移动距离超过了竖直移动距离
      if (Math.abs(this.moveX) > Math.abs(this.moveY)) {
        this.direction = 'X'
        return
      }
      this.direction = 'Y'
      // 以下两种情况不进行移动：1. 在最下面边时向下滑动; 2. 在最上面边时向上滑动
      if ((this.startY === -bottomDistance && this.moveY > 0) || (Math.abs(this.data.translateY) >= this.data.wrapHeight && this.moveY < 0)) {
        return
      } else {
        this.setData({
          translateY: this.moveY + this.startY
        })
      }
    },

    /**
     * 处理touchend事件
     */
    handleTouchEnd: function(e) {
      const { bottomDistance, triggerDistance } = this.data
      // 非上下滑动时不进行任何操作
      if (this.direction !== 'Y') {
        return
      }
      let translateY = 0
      if ((Math.abs(this.data.translateY) > this.data.wrapHeight - triggerDistance) || ((Math.abs(this.data.translateY) >= bottomDistance + triggerDistance) && this.moveY < 0)) {
        translateY = -this.data.wrapHeight
        this.triggerEvent('onReachTop')
      } else {
        translateY = -bottomDistance
        this.triggerEvent('onReachBottom')
      }
      this.setData({
        animate: true
      }, () => {
        this.setData({
          translateY
        })
      })
    },
    setTranslate(translateY) {
      this.setData({
        animate: true
      }, () => {
        this.setData({
          translateY
        })
      })
    }
  },
  ready() {
    this.setData({
      translateY: -this.data.bottomDistance
    })
  }
})
