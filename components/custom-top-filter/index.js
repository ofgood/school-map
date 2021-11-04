const { areaMarkerData } = require('../../dict/areaData')
function _getAreaData (data){
  const result = []
  data.forEach(item => {
    const { id, title: text } = item
    result.push({
      id,
      text,
      disabled: id === 101 ? false : true
    })
  })
  return result
}
const areaData = _getAreaData(areaMarkerData)
Component({
  options: {
    styleIsolation: 'shared'
  },
  data: {
    showOverlay: false,
    dropDownIdList: ['#areaDropdown', '#placeTypeDropdown', '#publicOrPrivteDropDown', '#levelDropDown', '#moreDropDown']
  },
  properties: {
    area: {
      type: Array,
      value: [
        {
          // 导航名称
          text: '区域',
          // 禁用选项
          disabled: false,
          // 该导航下所有的可选项
          children: [
            {
              // 名称
              text: '不限',
              // id，作为匹配选中状态的标识
              id: 0
            },
            ...areaData
          ]
        },
        {
          text: '附近',
          children: [
            {
              text: '1km',
              id: 201
            },
            {
              text: '2km',
              id: 202
            },
            {
              text: '3km',
              id: 203
            }
          ]
        }
      ]
    },
    areaTitle: {
      type: String,
      value: '区域'
    },
    areaActiveIndex: {
      type: Number,
      value: 0
    },
    areaActiveId: {
      type: Number,
      value: 0
    },
    schoolTypes: {
      type: Array,
      value: [
        {
          type: 'nursery',
          name: '幼儿园'
        },
        {
          type: 'primary',
          name: '小学'
        },
        {
          type: 'junior',
          name: '初中'
        }
      ]
    },
    schoolType: {
      type: String,
      value: 'primary'
    },
    publicOrPrivte: {
      type: Array,
      value: [
        {
          type: 'public',
          name: '公办'
        },
        {
          type: 'privte',
          name: '民办'
        }
      ]
    },
    nature: {
      type: String,
      value: 'public'
    },
    levels: {
      type: Array,
      value: [
        {
          type: '1',
          name: '重点'
        },
        {
          type: '2',
          name: '普通'
        }
      ]
    },
    level: {
      type: String,
      value: '1'
    },
    more: {
      type: String,
      value: ''
    },
    distance: {
      type: Number,
      value: 1
    }
  },
  ready() {
  },
  methods: {
    onClickSearch() {
      this.triggerEvent('onClickSearch')
    },
    onClickNav({ detail }) {
      this.setData({
        areaActiveIndex: detail.index || 0
      });
    },
    onClickItem({ detail }) {
      const activeId = this.data.areaActiveId === detail.id ? null : detail.id
      this.setData({ areaActiveId: activeId })
    },
    onClickOverlay() {
      this.triggerEvent('onClickOverlay')
    },
    onOpenDropdown() {
      this.triggerEvent('onOpenDropdown')
      this.setData({
        showOverlay: true
      })
    },
    onCloseDropdown() {
      this.triggerEvent('onCloseDropdown')
      this.setData({
        showOverlay: false
      })
    },
    onclickCustomDropdownItem({ target }) {
      const { dataset } = target
      const { type, value } = dataset
      this.setData({
        [type]: value
      })
    },
    onClickConfirm() {
      this.triggerEvent('onClickConfirm', {
        ...this.data
      })
    },
    onClickReset() {
      console.log(this)
      this.triggerEvent('onClickReset')
    },
    resetData({ target }) {
      const { dataset } = target
      console.log(this)
    }
  }
})
