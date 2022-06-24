import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { dicStore } from '../../../store/dic'
import { addMessage } from '../../../api/school-map'
Page({
  behaviors: [storeBindingsBehavior],
  storeBindings: {
    store: dicStore,
    fields: [
      'dicMap'
    ]
  },
  data: {
    defaultIndex: 1,
    contact: '',
    message: '',
    nickName: '',
    fileList: [],
    type: '',
    typeText: '',
    columns: [
      // { value: '1', label: '学校', status: 0 },
      // { value: '2', label: '学区', status: 0 },
      // { value: '3', label: '小区', status: 0 },
      // { value: '99', label: '其他', status: 0 }
    ],
    autosizeStyle: {
      maxHeight: 160,
      minHeight: 60
    },
    hasUserInfo: false,
    userInfo: null
  },
  goBack() {
    wx.navigateBack(
      {
        delta: 1
      }
    )
  },
  onClickInputType() {
    const { user_message_type } = this.data.dicMap
    // console.log(user_message_type)
    this.setData({
      columns: user_message_type,
      showTypePicker: true
    })
    this.getPickerValue()
  },
  onCloseTypePicker() {
    this.setData({
      showTypePicker: false
    })
  },
  onChangeType() {

  },
  onCancelPicker() {
    this.setData({
      showTypePicker: false
    })
  },
  onConfirmPicker() {
    const [selected] = this.getPickerValue()
    const { label, value } = selected
    console.log(label)
    console.log(value)
    this.setData({
      showTypePicker: false,
      typeText: label,
      type: value
    })
  },
  getPickerValue() {
    const picker = this.selectComponent('#typePicker')
    return picker.getValues() || []
  },
  async onClickSubmit() {
    const { contact, message, nickName, type } = this.data
    if (!type) {
      wx.showToast({
        title: '请选择反馈类型!',
        icon: 'none',
        duration: 1500,
        mask: false
      })
      return
    }
    if (!message) {
      wx.showToast({
        title: '请填写留言内容!',
        icon: 'none',
        duration: 1500,
        mask: false
      })
      return
    }
    wx.showLoading()
    const res = await addMessage({
      contact,
      message,
      nickName,
      type
    })
    wx.hideLoading()
    const { success } = res
    if (success) {
      wx.showToast({
        title: '谢谢您宝贵的意见,我们会尽快处理!',
        icon: 'none',
        duration: 3500,
        mask: false
      })
      setTimeout(() => {
        this.goBack()
      }, 3500)
    } else {
      wx.showToast({
        title: res.message,
        icon: 'none',
        duration: 1500,
        mask: false
      })
    }
  },
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于方便及时处理您的反馈',
      success: (res) => {
        this.setData({
          nickName: res.userInfo.nickName,
          hasUserInfo: true
        })
      }
    })
  }
})
