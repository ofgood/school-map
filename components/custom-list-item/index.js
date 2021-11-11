Component({
  properties: {},
  data: {},
  methods: {
    onClickItem () {
      this.triggerEvent('onClickItem', {
        ...this.data
      })
    }
  }
})
