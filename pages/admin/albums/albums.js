const app = getApp()
const util = require('../../../utils/util.js')

Page({
  data: {
    albums: []
  },

  async onLoad() {
    await this.checkPermission()
  },

  onShow() {
    this.loadAlbums()
  },

  async checkPermission() {
    const isAdmin = await app.waitForUserRole()
    if (!isAdmin) {
      util.showError('无权限访问')
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async loadAlbums() {
    try {
      const r = await util.callFunction('adminAlbums', { action: 'list' })
      if (r.ok) {
        this.setData({ albums: r.data || [] })
      }
    } catch (err) {
      console.error('加载作品集失败:', err)
      util.showError('加载失败')
    }
  },

  addAlbum() {
    wx.navigateTo({
      url: '/pages/admin/album-edit/album-edit'
    })
  },

  editAlbum(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/album-edit/album-edit?id=${id}`
    })
  },

  async deleteAlbum(e) {
    const id = e.currentTarget.dataset.id
    const confirm = await util.showConfirm('确定删除该作品集吗?')
    
    if (confirm) {
      try {
        util.showLoading('删除中...')
        const r = await util.callFunction('adminAlbums', { action: 'delete', id })
        if (r.ok) {
          util.showSuccess('删除成功')
          util.clearCache('homeData')
          util.clearCache('categories')
          this.loadAlbums()
        } else {
          throw new Error(r.message || '删除失败')
        }
      } catch (err) {
        console.error('删除失败:', err)
        util.showError('删除失败')
      } finally {
        util.hideLoading()
      }
    }
  }
})
