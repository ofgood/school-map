const {
  areaMarkerData
} = require('../../dict/areaData')
function _getAreaData(data) {
  const result = []
  data.forEach(item => {
    const { id, title: text } = item
    result.push({
      id,
      text,
      disabled: id !== 101
    })
  })
  return result
}
const areaData = _getAreaData(areaMarkerData)
const areas = [
  {
    // 导航名称
    text: '区域',
    // 禁用选项
    disabled: false,
    // 该导航下所有的可选项
    children: [
      ...areaData
    ]
  },
  {
    text: '附近',
    disabled: true,
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
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { dicStore } from '../../store/dic'
Component({
  options: {
    styleIsolation: 'shared'
  },
  data: {
    areaTitle: '区域',
    area: '',
    areas: areas,
    areaActiveIndex: 0,
    areaActiveId: 0,

    type: '1',
    typeTitle: '学校',
    types: [
      {
        value: '1',
        label: '学校'
      },
      {
        value: '2',
        label: '小区'
      }
    ],

    placeNature: '',
    placeNatureTitle: '性质',
    placeNatures: [],

    placeTypeTitle: '分类',
    placeType: '',
    placeTypes: [],

    grade: '',
    grades: [
      {
        type: '1',
        name: '普通'
      },
      {
        type: '2',
        name: '重点'
      }
    ],
    showOverlay: false,
    more: '',
    confirmCacheData: {}
  },
  behaviors: [storeBindingsBehavior],
  storeBindings: {
    store: dicStore,
    fields: [
      'dicMap'
    ]
  },
  observers: {
    dicMap(val) {
      if (Object.keys(val).length) {
        const { school_nature, school_type } = val
        console.log(school_type)
        this.data.placeNatures = school_nature
        this.data.placeTypes = school_type
      }
      console.log(val)
    },
    type(val) {
      const { house_nature, school_nature, school_type, house_type } = this.data.dicMap
      const natrueMap = {
        '1': [...school_nature],
        '2': [...house_nature]
      }
      const typeMap = {
        '1': [...school_type],
        '2': [...house_type]
      }
      this.setData({
        placeNatures: natrueMap[val],
        placeTypes: typeMap[val]
      })
    },
    placeNature() {
      this.setData()
    }
  },
  methods: {
    onClickSearch() {
      this.triggerEvent('onClickSearch')
    },
    onClickNav({ detail }) {
      this.setData({
        areaActiveIndex: detail.index || 0
      })
    },
    onClickItem({ detail }) {
      const activeId = this.data.areaActiveId === detail.id ? null : detail.id
      const { text } = detail
      this.setData({ areaActiveId: activeId, areaTitle: text })
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
    onCloseDropdown({ currentTarget }) {
      const { dataset } = currentTarget
      console.log(currentTarget)
      const { type } = dataset
      if (!Object.keys(this.data.confirmCacheData).length) {
        this._resetData(type)
      } else {
        this._resetPreData(type)
      }
      this.triggerEvent('onCloseDropdown')
      this.setData({
        showOverlay: false
      })
    },
    onclickCustomDropdownItem({ target }) {
      const { dataset } = target
      console.log(target)
      const { type, value, title } = dataset
      this.setData({
        [type]: value,
        [`${type}Title`]: title
      })
    },
    onClickConfirm({ currentTarget }) {
      const { dataset } = currentTarget
      const { type } = dataset
      const typeValue = this.data.confirmCacheData.type
      this.setData({
        confirmCacheData: {
          ...this.data
        }
      })
      const { areaTitle, placeType, placeNature, areaActiveId } = this.data
      this.triggerEvent('onClickConfirm', {
        area: areaTitle,
        placeType,
        placeNature,
        type: this.data.type,
        areaActiveId
      })
      this.setData({
        showOverlay: false
      })
      this.selectComponent(`#${type}`).toggle(false)
      console.log(this.data.confirmCacheData.type)
      if (Object.keys(this.data.confirmCacheData).length) {
        if (type === 'type' && typeValue !== this.data.confirmCacheData.type) {
          this.setData({
            placeNature: '',
            placeNatureTitle: '性质',
            placeTypeTitle: '分类',
            placeType: ''
          })
          this.setData({
            confirmCacheData: {
              ...this.data
            }
          })
        }
      }
    },
    onChangeGrade(event) {
      this.setData({
        grade: event.detail
      })
    },
    onClickReset({ currentTarget }) {
      const { dataset } = currentTarget
      const { type } = dataset
      this._resetData(type)
      this.triggerEvent('onClickReset', {
      })
    },
    _resetData(type) {
      switch (type) {
        case 'area' :
          this.setData({
            areaTitle: '区域',
            area: areas,
            areaActiveIndex: 0,
            areaActiveId: 0
          })
          break
        case 'type':
          this.setData({
            type: '1',
            typeTitle: '学校',
            types: this.data.types
          })
          break
        case 'placeNature':
          this.setData({
            placeNature: '',
            placeNatureTitle: '性质'
          })
          break
        case 'placeType':
          this.setData({
            placeTypeTitle: '分类',
            placeType: ''
          })
          break
        case 'more':
          this.setData({
            grade: ''
          })
          break
      }
    },
    resetAll() {
      this.setData({
        areaTitle: '区域',
        area: areas,
        areaActiveIndex: 0,
        areaActiveId: 0,
        type: '1',
        typeTitle: '学校',
        types: this.data.types,
        placeNature: '',
        placeNatureTitle: '性质',
        placeTypeTitle: '分类',
        placeType: '',
        grade: ''
      })
    },
    _resetPreData(type) {
      switch (type) {
        case 'area' : {
          const { areaTitle, areaActiveIndex, areaActiveId } = this.data.confirmCacheData
          this.setData({
            areaTitle,
            areaActiveIndex,
            areaActiveId
          })
          break
        }
        case 'type': {
          const { type, typeTitle } = this.data.confirmCacheData
          this.setData({
            type,
            typeTitle
          })
          break
        }
        case 'placeNature': {
          const { placeNature, placeNatureTitle } = this.data.confirmCacheData
          this.setData({
            placeNature,
            placeNatureTitle
          })
          break
        }
        case 'placeType': {
          const { placeTypeTitle, placeType } = this.data.confirmCacheData
          this.setData({
            placeTypeTitle,
            placeType
          })
          break
        }
        case 'more': {
          const { grade } = this.data.confirmCacheData
          this.setData({
            grade
          })
          break
        }
      }
    }
  }
})
