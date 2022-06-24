Component({
  properties: {
    areaData: {
      type: Array,
      value: [
        {
          rate: 1,
          type: 'nursery',
          schoolCount: 4000,
          studentCount: 430000
        },
        {
          rate: 1,
          type: 'primary',
          schoolCount: 5000,
          studentCount: 480000
        },
        {
          rate: 1,
          type: 'middle',
          schoolCount: 3000,
          studentCount: 633000
        },
        {
          rate: 1,
          type: 'high',
          schoolCount: 4000,
          studentCount: 723000
        }
      ]
    }
  },
  observers: {
    areaData(val) {
      if (val.length) {
        const { schoolCountMax, studentCountMax } = this._getMaxNum()
        const { schoolPercent, studentPercent } = this._getPercent()
        this.setData({
          topCount: this._setUnit(parseInt(this._getUpCount(studentCountMax))),
          middleCount: this._setUnit(parseInt(this._getUpCount(studentCountMax) / 2)),
          bottomCount: this._setUnit(parseInt(this._getUpCount(schoolCountMax))),
          bottomMiddleCount: this._setUnit(parseInt(this._getUpCount(schoolCountMax) / 2)),
          schoolPercent,
          studentPercent
        })
      }
    }
  },
  data: {
    // activeIndex: 0
    schoolHeight: 60,
    studentHeight: 60,
    topCount: '',
    middleCount: '',
    bottomCount: '',
    bottomMiddleCount: '',
    schoolPercent: 0,
    studentPercent: 0
  },
  methods: {
    onClickChartItem(data) {
      const { index: activeIndex } = data.currentTarget.dataset
      this.setData({
        activeIndex
      })
    },
    onClickChartContent(data) {
      this.setData({
        activeIndex: -1
      })
    },
    _getUpCount(num) {
      const tempNumStr = parseInt(num).toString()
      const firstNum = tempNumStr.slice(0, 1)
      return Math.pow(10, tempNumStr.length - 1) * (Number(firstNum) + 1)
    },
    _setUnit(num) {
      if (num === 0) {
        return 0
      }
      if (!Number.isNaN(num)) {
        const length = num.toString().length
        return length > 5 ? parseInt(num / 10000) + 'w' : num
      }
    },
    _getNumArr() {
      const { areaData } = this.data
      const schoolCountArr = areaData.map(item => item.schoolCount)
      const studentCountArr = areaData.map(item => item.studentCount)
      return {
        schoolCountArr,
        studentCountArr
      }
    },
    _getMaxNum() {
      const { schoolCountArr, studentCountArr } = this._getNumArr()
      console.log(schoolCountArr)
      return {
        schoolCountMax: Math.max.apply(null, schoolCountArr),
        studentCountMax: Math.max.apply(null, studentCountArr)
      }
    },
    _getUpNum() {
      const { schoolCountMax, studentCountMax } = this._getMaxNum()
      return {
        schoolUpCount: this._getUpCount(schoolCountMax),
        studentUpCount: this._getUpCount(studentCountMax)
      }
    },
    _getPercent() {
      const { schoolHeight, studentHeight } = this.data
      const { schoolUpCount, studentUpCount } = this._getUpNum()
      return {
        schoolPercent: schoolHeight / schoolUpCount,
        studentPercent: studentHeight / studentUpCount
      }
    }
  }
})
