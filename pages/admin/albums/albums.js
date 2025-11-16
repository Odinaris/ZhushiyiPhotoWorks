const app = getApp()
const util = require('../../../utils/util.js')

Page({
  data: {
    albums: []
  },

  onLoad() {
    this.checkPermission()
  },

  onShow() {
    this.loadAlbums()
  },

  checkPermission() {
    if (!app.globalData.isAdmin) {
      util.showError('无权限访问')
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async loadAlbums() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'adminAlbums',
        data: { action: 'list' }
      })

      if (res.result && res.result.success) {
        this.setData({ albums: res.result.data || [] })
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
        const res = await wx.cloud.callFunction({
          name: 'adminAlbums',
          data: { action: 'delete', id }
        })

        if (res.result && res.result.success) {
          util.showSuccess('删除成功')
          this.loadAlbums()
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
  }
})
