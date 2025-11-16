const app = getApp()
const util = require('../../../utils/util.js')

Page({
  data: {
    albumId: '',
    isEdit: false,
    categories: [],
    categoryIndex: 0,
    formData: {
      title: '',
      description: '',
      categoryId: '',
      categoryName: '',
      coverImage: '',
      images: [],
      isFeatured: false,
      isActive: true,
      order: 0
    }
  },

  async onLoad(options) {
    await this.checkPermission()
    this.loadCategories()
    
    if (options.id) {
      this.setData({ 
        albumId: options.id,
        isEdit: true
      })
      this.loadAlbumDetail(options.id)
    }
  },

  async checkPermission() {
    const isAdmin = await app.waitForUserRole()
    if (!isAdmin) {
      util.showError('无权限访问')
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async loadCategories() {
    try {
      const r = await util.callFunction('getCategories')
      if (r.ok) {
        this.setData({ categories: r.data || [] })
      }
    } catch (err) {
      console.error('加载分类失败:', err)
    }
  },

  async loadAlbumDetail(id) {
    try {
      util.showLoading('加载中...')
      const r = await util.callFunction('getAlbumDetail', { albumId: id })
      if (r.ok) {
        const album = r.data
        const categoryIndex = this.data.categories.findIndex(c => c._id === album.categoryId)
        
        this.setData({
          formData: album,
          categoryIndex: categoryIndex >= 0 ? categoryIndex : 0
        })
      }
    } catch (err) {
      console.error('加载作品集详情失败:', err)
      util.showError('加载失败')
    } finally {
      util.hideLoading()
    }
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: field === 'order' ? Number(value) : value
    })
  },

  onCategoryChange(e) {
    const index = e.detail.value
    const category = this.data.categories[index]
    this.setData({
      categoryIndex: index,
      'formData.categoryId': category._id,
      'formData.categoryName': category.name
    })
  },

  onSwitchChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  async chooseCover() {
    try {
      const fileIDs = await util.chooseAndUploadImage(1, 'covers')
      if (fileIDs && fileIDs.length > 0) {
        this.setData({
          'formData.coverImage': fileIDs[0]
        })
      }
    } catch (err) {
      console.error('上传封面失败:', err)
      util.showError('上传失败')
    }
  },

  async chooseImages() {
    try {
      const fileIDs = await util.chooseAndUploadImage(9, `albums/${this.data.albumId || 'temp'}`)
      if (fileIDs && fileIDs.length > 0) {
        const newImages = fileIDs.map((url, index) => ({
          url,
          order: this.data.formData.images.length + index,
          description: ''
        }))
        
        this.setData({
          'formData.images': [...this.data.formData.images, ...newImages]
        })
      }
    } catch (err) {
      console.error('上传图片失败:', err)
      util.showError('上传失败')
    }
  },

  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.formData.images
    images.splice(index, 1)
    
    this.setData({
      'formData.images': images
    })
  },

  async saveAlbum() {
    const { title, categoryId, coverImage, images } = this.data.formData
    
    if (!title.trim()) {
      util.showError('请输入作品集标题')
      return
    }
    if (!categoryId) {
      util.showError('请选择分类')
      return
    }
    if (!coverImage) {
      util.showError('请选择封面图片')
      return
    }
    if (images.length === 0) {
      util.showError('请至少添加一张作品图片')
      return
    }

    try {
      util.showLoading('保存中...')
      
      // 准备提交的数据,移除空的_id
      const submitData = { ...this.data.formData }
      if (!this.data.isEdit || !submitData._id) {
        delete submitData._id
      }
      
      const r = await util.callFunction('adminAlbums', { action: this.data.isEdit ? 'update' : 'add', data: submitData })
      if (r.ok) {
        util.showSuccess('保存成功')
        util.clearCache('homeData')
        util.clearCache('categories')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error(r.message || '保存失败')
      }
    } catch (err) {
      console.error('保存失败:', err)
      util.showError('保存失败')
    } finally {
      util.hideLoading()
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
