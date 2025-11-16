const app = getApp()
const util = require('../../../utils/util.js')

Page({
  data: {
    banners: [],
    showModal: false,
    modalTitle: '',
    formData: {
      _id: '',
      imageUrl: '',
      order: 0,
      isActive: true
    },
    isEdit: false
  },

  onLoad() {
    this.checkPermission()
    this.loadBanners()
  },

  checkPermission() {
    if (!app.globalData.isAdmin) {
      util.showError('无权限访问')
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async loadBanners() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'adminBanners',
        data: { action: 'list' }
      })

      if (res.result && res.result.success) {
        this.setData({ banners: res.result.data || [] })
      }
    } catch (err) {
      console.error('加载轮播图失败:', err)
      util.showError('加载失败')
    }
  },

  addBanner() {
    this.setData({
      showModal: true,
      modalTitle: '添加轮播图',
      isEdit: false,
      formData: {
        _id: '',
        imageUrl: '',
        order: this.data.banners.length + 1,
        isActive: true
      }
    })
  },

  editBanner(e) {
    const item = e.currentTarget.dataset.item
    this.setData({
      showModal: true,
      modalTitle: '编辑轮播图',
      isEdit: true,
      formData: { ...item }
    })
  },

  async deleteBanner(e) {
    const id = e.currentTarget.dataset.id
    const confirm = await util.showConfirm('确定删除该轮播图吗?')
    
    if (confirm) {
      try {
        util.showLoading('删除中...')
        const res = await wx.cloud.callFunction({
          name: 'adminBanners',
          data: {
            action: 'delete',
            id
          }
        })

        if (res.result && res.result.success) {
          util.showSuccess('删除成功')
          this.loadBanners()
        } else {
          throw new Error(res.result?.message || '删除失败')
        }
      } catch (err) {
        console.error('删除失败:', err)
        util.showError('删除失败')
      } finally {
        util.hideLoading()
      }
    }
  },

  async chooseImage() {
    try {
      const fileIDs = await util.chooseAndUploadImage(1, 'banners')
      if (fileIDs && fileIDs.length > 0) {
        this.setData({
          'formData.imageUrl': fileIDs[0]
        })
      }
    } catch (err) {
      console.error('上传图片失败:', err)
      util.showError('上传失败')
    }
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: field === 'order' ? Number(value) : value
    })
  },

  onSwitchChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  async saveBanner() {
    const { imageUrl, order } = this.data.formData
    
    if (!imageUrl) {
      util.showError('请选择图片')
      return
    }

    try {
      util.showLoading('保存中...')
      
      // 准备提交的数据,移除空的_id
      const submitData = { ...this.data.formData }
      if (!this.data.isEdit || !submitData._id) {
        delete submitData._id
      }
      
      const res = await wx.cloud.callFunction({
        name: 'adminBanners',
        data: {
          action: this.data.isEdit ? 'update' : 'add',
          data: submitData
        }
      })

      if (res.result && res.result.success) {
        util.showSuccess('保存成功')
        this.closeModal()
        this.loadBanners()
      } else {
        throw new Error(res.result?.message || '保存失败')
      }
    } catch (err) {
      console.error('保存失败:', err)
      util.showError('保存失败')
    } finally {
      util.hideLoading()
    }
  },

  closeModal() {
    this.setData({ showModal: false })
  },

  stopPropagation() {}
})
