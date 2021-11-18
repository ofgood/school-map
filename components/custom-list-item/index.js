Component({
  properties: {},
  data: {
    schools: [1,2,3,4,5,10,6,7,8,2,4,1,2]
  },
  methods: {
    onClickItem() {
      this.triggerEvent('onClickItem', {
        ...this.data
      })
    },

    onCatchTapSuited() {
      this.triggerEvent('onCatchTapSuited', {
        ...this.data
      })
    }
  }
})
