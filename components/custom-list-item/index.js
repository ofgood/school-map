Component({
  properties: {
    list: {
      type: Array,
      value: []
    }
  },
  data: {

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
