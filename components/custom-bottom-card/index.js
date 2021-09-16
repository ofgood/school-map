Component({
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
      value: -100
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    translateX: 0,
    animate: false,
    wrapHeight: wx.getSystemInfoSync().windowHeight - 200,
    winHeight: wx.getSystemInfoSync().windowHeight,
    touchStartY: 0,
    triggerDistance: 100
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
      const { bottomDistance } = this.data
      this.touchMoveX = e.touches[0].pageX
      this.touchMoveY = e.touches[0].pageY
      this.moveX = this.touchMoveX - this.touchStartX
      this.moveY = this.touchMoveY - this.touchStartY
      // 左右移动距离超过了竖直移动距离
      if (Math.abs(this.touchMoveX - this.touchStartX) > Math.abs(this.moveY)) {
        this.direction = 'X'
        return
      }
      this.direction = 'Y'
      // 以下两种情况不进行移动：1. 在最下面边时向下滑动; 2. 在最上面边时向上滑动
      if ((this.startY === -bottomDistance && this.moveY > 0) || (this.startY === -this.winHeight && this.moveY < 0)) {
        return
      } else {
        this.setData({
          translateY: this.touchMoveY - this.touchStartY + this.startY
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
      console.log('bottomDistance', bottomDistance)
      console.log('triggerDistance', triggerDistance)
      console.log(this.startY)
      console.log(this.moveY)
      if (this.moveY > 0 && (this.startY < -bottomDistance)) {
        //从高位往下滑动, 如果下滑的距离大于触发距离,使卡片移动到最低位, 反之回到原位置(最高位置), 此时moveY 为正数
        // if () {
        //   if (this.moveY > triggerDistance) {
        //     translateY = -bottomDistance
        //   } else {
        //     translateY = -this.wrapHeight
        //   }
        // } else {
        //   // 反之判断为从低位置向上滑动,大于触发距离,使卡片移动到最高位置,反之回到原位置(最低位),此时moveY为负数
        //   if (this.moveY > -triggerDistance) {
        //     translateY = -this.wrapHeight
        //   } else {
        //     translateY = -bottomDistance
        //   }
        // }
      }

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
