
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { dicStore } from '../../store/dic'

Component({
  behaviors: [storeBindingsBehavior],
  storeBindings: {
    store: dicStore,
    fields: ['dicMap']
  },
  properties: {
    list: {
      type: Array,
      value: []
    },
    loading: {
      type: Boolean,
      value: false
    },
    loadFinished: {
      type: Boolean,
      value: false
    },
    error: {
      type: Boolean,
      value: false
    }
  },
  data: {

  },
  methods: {
    onClickItem(e) {
      const { dataset: { value = {}}} = e.currentTarget
      this.triggerEvent('onClickItem', {
        ...value
      })
    },

    onCatchTapSuited() {
      this.triggerEvent('onCatchTapSuited', {
        ...this.data
      })
    }
  }
})
