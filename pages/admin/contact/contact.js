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

  async onLoad() {
    await this.checkPermission()
    this.loadContact()
  },

  async checkPermission() {
    const isAdmin = await app.waitForUserRole()
    if (!isAdmin) {
      util.showError('无权限访问')
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async loadContact() {
    try {
      util.showLoading('加载中...')
      const r = await util.callFunction('adminContact', { action: 'get' })
      if (r.ok && r.data) {
        this.setData({ formData: r.data })
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
      const r = await util.callFunction('adminContact', { action: 'update', data: this.data.formData })
      if (r.ok) {
        util.showSuccess('保存成功')
        util.clearCache('contactInfo')
      } else {
        throw new Error(r.message || '保存失败')
      }
    } catch (err) {
      console.error('保存失败:', err)
      util.showError('保存失败')
    } finally {
      util.hideLoading()
    }
  }
})
