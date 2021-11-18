Component({
  properties: {
    text:{
      type: String
    }
  },
  data: {
    seeMore: false
  },
  methods: {
    onCatchtap () {
      this.triggerEvent('onCatchtap')
    }
  },
  lifetimes: {
    attached() {
      console.log(1)
      let _this = this
      const query = this.createSelectorQuery();
      query.selectAll('#textFour_box').fields({
        size: true,
      }).exec( (res) => {
        const lineHeight = 26
        const result = res[0][0]
        if(result.height/lineHeight > 5) {
         _this.setData({
           seeMore: true
         })
        }
      })
    },
  }
})
