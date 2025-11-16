const app = getApp()
const util = require('../../../utils/util.js')

Page({
  data: {
    formData: {
      brandName: '',
      slogan: '',
      introduction: '',
      styles: []
    },
    stylesStr: ''
  },

  onLoad() {
    this.checkPermission()
    this.loadProfile()
  },

  checkPermission() {
    if (!app.globalData.isAdmin) {
      util.showError('无权限访问')
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async loadProfile() {
    try {
      util.showLoading('加载中...')
      const res = await wx.cloud.callFunction({
        name: 'adminProfile',
        data: { action: 'get' }
      })

      if (res.result && res.result.success && res.result.data) {
        const data = res.result.data
        this.setData({
          formData: data,
          stylesStr: data.styles ? data.styles.join(',') : ''
        })
      }
    } catch (err) {
      console.error('加载品牌信息失败:', err)
      util.showError('加载失败')
    } finally {
      util.hideLoading()
    }
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  onStylesChange(e) {
    const value = e.detail.value
    const styles = value.split(',').map(s => s.trim()).filter(s => s)
    this.setData({
      stylesStr: value,
      'formData.styles': styles
    })
  },

  async saveProfile() {
    const { brandName, slogan } = this.data.formData
    
    if (!brandName.trim()) {
      util.showError('请输入品牌名称')
      return
    }

    try {
      util.showLoading('保存中...')
      const res = await wx.cloud.callFunction({
        name: 'adminProfile',
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
