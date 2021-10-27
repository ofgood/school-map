Component({
  properties: {},
  data: {
    areaData: [
      {
        type: 'nursery',
        schoolCount: 4000,
        studentCount: 430000
      },
      {
        type: 'primary',
        schoolCount: 5000,
        studentCount: 480000
      },
      {
        type: 'middle',
        schoolCount: 3000,
        studentCount: 633000
      },
      {
        type: 'high',
        schoolCount: 4000,
        studentCount: 723000
      }
    ],
    activeIndex: 0
  },
  methods: {
    onClickChartItem (data) {
      const { index: activeIndex } = data.currentTarget.dataset
      this.setData({
        activeIndex
      })
    }
  }
})
