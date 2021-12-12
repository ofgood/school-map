import { observable, action } from 'mobx-miniprogram'
import { getByType } from '../api/school-map'
import { formatDic, handlePromiseAll } from '../utils/index'
export const dicStore = observable({
  dicKeys: [
    'school_type', // 学校类型
    'school_nature', // 学校性质
    'school_tag', // 学校标签
    'school_echelon', // 学校梯队
    'shcool_level', // 学校属性
    'school_range', // 招生范围
    'house_type', //  小区类型
    'house_tag', // 小区标签
    'house_nature' // 小区性质,
  ],
  'school_type': [], // 学校类型
  'school_nature': [], // 学校性质
  'school_tag': [], // 学校标签
  'school_echelon': [], // 学校梯队
  'shcool_level': [], // 学校属性
  'school_range': [], // 招生范围

  'house_type': [], //  小区类型
  'house_tag': [], // 小区标签
  'house_nature': [], // 小区性质,
  dicMap: {},
  get schoolType() {
    return formatDic(this.school_type)
  },
  get schoolNature() {
    return formatDic(this.school_nature)
  },
  get schoolTag() {
    return formatDic(this.school_tag)
  },
  get schoolEchelon() {
    return formatDic(this.school_echelon)
  },
  get schoolRange() {
    return formatDic(this.school_range)
  },
  get houseType() {
    return formatDic(this.house_type)
  },
  get houseTag() {
    return formatDic(this.house_tag)
  },
  get houseNature() {
    return formatDic(this.house_nature)
  },
  // actions
  getDic: action(async function(key) {
    const res = await getByType(key)
    this[key] = res.result || []
  }),
  fetchAllDic: action(async function() {
    const result = {}
    const promiseList = this.dicKeys.map(key => {
      return {
        key,
        promise: getByType(key)
      }
    })
    const promiseAllRes = await Promise.all(handlePromiseAll(promiseList))
    promiseAllRes.map(({ key, res, success }) => {
      let promiseResult = []
      if (res.success && res.result) {
        promiseResult = res.result
      }
      success ? result[key] = formatDic(promiseResult) : result[key] = []
    })
    this.dicMap = result
  })
})
