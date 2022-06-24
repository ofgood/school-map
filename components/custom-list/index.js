
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
    }
  },
  methods: {
    onClickItem(e) {
      const { dataset: { value = {}}} = e.currentTarget
      this.triggerEvent('onClickItem', {
        ...value
      })
    }
  }
})
