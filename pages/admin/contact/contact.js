const app = getApp()
const util = require('../../../utils/util.js')

Page({
  data: {
    formData: {
      logo: '',
      brandName: '',
      slogan: '',
      location: '',
      introduction: '',
      styles: [],
      phone: '',
      wechat: '',
      email: '',
      workingHours: ''
    },
    stylesStr: ''
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
      const r = await util.callFunction('adminPhotographer', { action: 'get' })
      if (r.ok && r.data) {
        const data = r.data
        this.setData({ 
          formData: data,
          stylesStr: data.styles ? data.styles.join(',') : ''
        })
      }
    } catch (err) {
      console.error('加载摄影师信息失败:', err)
      util.showError('加载失败')
    } finally {
      util.hideLoading()
    }
  },

  // 上传品牌Logo
  uploadLogo() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.uploadFile(tempFilePath, 'logo')
      }
    })
  },

  // 上传文件到云存储
  async uploadFile(filePath, fieldName) {
    try {
      util.showLoading('上传中...')
      const cloudPath = `photographer/${fieldName}_${Date.now()}.jpg`
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath
      })
      
      const fileID = uploadRes.fileID
      this.setData({
        [`formData.${fieldName}`]: fileID
      })
      util.showSuccess('上传成功')
    } catch (err) {
      console.error('上传失败:', err)
      util.showError('上传失败')
    } finally {
      util.hideLoading()
    }
  },

  // 删除Logo
  deleteLogo() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除品牌Logo吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            'formData.logo': ''
          })
        }
      }
    })
  },

  // 拍摄风格变化
  onStylesChange(e) {
    const value = e.detail.value
    const styles = value.split(',').map(s => s.trim()).filter(s => s)
    this.setData({
      stylesStr: value,
      'formData.styles': styles
    })
  },

  // 单个风格变化
  onStyleItemChange(e) {
    const index = e.currentTarget.dataset.index
    const value = e.detail.value
    const styles = [...this.data.formData.styles]
    styles[index] = value.trim()
    this.setData({
      'formData.styles': styles
    })
  },

  // 添加风格
  addStyle() {
    const styles = [...this.data.formData.styles]
    styles.push('')
    this.setData({
      'formData.styles': styles
    })
  },

  // 删除风格
  removeStyle(e) {
    const index = e.currentTarget.dataset.index
    const styles = [...this.data.formData.styles]
    styles.splice(index, 1)
    this.setData({
      'formData.styles': styles
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
      const r = await util.callFunction('adminPhotographer', { action: 'update', data: this.data.formData })
      if (r.ok) {
        util.showSuccess('保存成功')
        wx.removeStorageSync('photographerInfo_cache')
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
