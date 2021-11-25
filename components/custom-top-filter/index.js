const {
  areaMarkerData,
  communityNatures,
  schoolNatures,
  communityTypes,
  schoolTypes
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
        type: '1',
        name: '学校'
      },
      {
        type: '2',
        name: '小区'
      }
    ],

    placeNature: '',
    placeNatureTitle: '性质',
    placeNatures: [...schoolNatures],

    placeTypeTitle: '分类',
    placeType: '',
    placeTypes: [...schoolTypes],

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
  observers: {
    type(val) {
      const { type } = this.data.confirmCacheData
      const natrueMap = {
        '1': [...schoolNatures],
        '2': [...communityNatures]
      }
      const typeMap = {
        '1': [...schoolTypes],
        '2': [...communityTypes]
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
        this.__resetPreData(type)
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
      this.triggerEvent('onClickConfirm', {
        ...this.data
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
            types: [
              {
                type: '1',
                name: '学校'
              },
              {
                type: '2',
                name: '小区'
              }
            ]
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
    __resetPreData(type) {
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
