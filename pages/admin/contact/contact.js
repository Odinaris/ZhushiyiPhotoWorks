const app = getApp()
const util = require('../../../utils/util.js')

Page({
  data: {
    formData: {
      qaList: [],
      contacts: [],
      workingHours: '',
      location: ''
    }
  },

  onLoad() {
    this.checkPermission()
    this.loadContact()
  },

  checkPermission() {
    if (!app.globalData.isAdmin) {
      util.showError('无权限访问')
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async loadContact() {
    try {
      util.showLoading('加载中...')
      const res = await wx.cloud.callFunction({
        name: 'adminContact',
        data: { action: 'get' }
      })

      if (res.result && res.result.success && res.result.data) {
        this.setData({ formData: res.result.data })
      }
    } catch (err) {
      console.error('加载联系信息失败:', err)
      util.showError('加载失败')
    } finally {
      util.hideLoading()
    }
  },

  addQA() {
    const qaList = this.data.formData.qaList
    qaList.push({
      question: '',
      answer: '',
      order: qaList.length
    })
    this.setData({ 'formData.qaList': qaList })
  },

  deleteQA(e) {
    const index = e.currentTarget.dataset.index
    const qaList = this.data.formData.qaList
    qaList.splice(index, 1)
    this.setData({ 'formData.qaList': qaList })
  },

  onQAChange(e) {
    const index = e.currentTarget.dataset.index
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.qaList[${index}].${field}`]: value
    })
  },

  addContact() {
    const contacts = this.data.formData.contacts
    contacts.push({
      type: '',
      label: '',
      value: '',
      icon: '',
      order: contacts.length
    })
    this.setData({ 'formData.contacts': contacts })
  },

  deleteContact(e) {
    const index = e.currentTarget.dataset.index
    const contacts = this.data.formData.contacts
    contacts.splice(index, 1)
    this.setData({ 'formData.contacts': contacts })
  },

  onContactChange(e) {
    const index = e.currentTarget.dataset.index
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.contacts[${index}].${field}`]: value
    })
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  async saveContact() {
    try {
      util.showLoading('保存中...')
      const res = await wx.cloud.callFunction({
        name: 'adminContact',
        data: {
          action: 'update',
          data: this.data.formData
        }
      })

      if (res.result && res.result.success) {
        util.showSuccess('保存成功')
      } else {
        throw new Error(res.result?.message || '保存失败')
      }
    } catch (err) {
      console.error('保存失败:', err)
      util.showError('保存失败')
    } finally {
      util.hideLoading()
    }
  }
})
