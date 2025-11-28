const app = getApp()
const util = require('../../../utils/util.js')

Page({
  data: {
    albums: [],
    categories: [],
    currentCategoryId: '',
    filteredAlbums: []
  },

  async onLoad() {
    await this.checkPermission()
    // 测试云函数连接
    this.testCloudFunction()
  },

  async testCloudFunction() {
    try {
      console.log('测试云函数连接...')
      const r = await util.callFunction('getUserRole', {})
      console.log('getUserRole 测试结果:', r)
    } catch (err) {
      console.error('云函数测试失败:', err)
    }
  },

  onShow() {
    console.log('页面显示，开始加载数据...')
    this.loadData()
  },

  async loadData() {
    try {
      await Promise.all([
        this.loadCategories(),
        this.loadAlbums()
      ])
      console.log('数据加载完成')
    } catch (err) {
      console.error('数据加载失败:', err)
    }
  },

  async checkPermission() {
    console.log('检查权限...')
    const isAdmin = await app.waitForUserRole()
    console.log('权限检查结果:', isAdmin)
    if (!isAdmin) {
      console.error('用户不是管理员，拒绝访问')
      util.showError('无权限访问')
      setTimeout(() => wx.navigateBack(), 1500)
    } else {
      console.log('权限验证通过，开始加载数据')
    }
  },

  async loadCategories() {
    try {
      console.log('开始加载分类...')
      const r = await util.callFunction('adminCategories', { action: 'list' })
      console.log('分类加载结果:', r)
      if (r.ok) {
        this.setData({ categories: r.data || [] })
      } else {
        console.error('分类加载失败:', r.message)
      }
    } catch (err) {
      console.error('加载分类异常:', err)
    }
  },

  async loadAlbums() {
    try {
      console.log('开始加载作品集...')
      util.showLoading('加载中...')
      const r = await util.callFunction('adminAlbums', { action: 'list' })
      console.log('作品集加载结果:', r)
      if (r.ok) {
        const albums = r.data || []
        console.log('作品集数据:', albums)
        this.setData({ 
          albums: albums,
          filteredAlbums: this.filterAlbumsByCategory(albums, this.data.currentCategoryId)
        })
      } else {
        console.error('作品集加载失败:', r.message)
        util.showError('加载失败: ' + (r.message || '未知错误'))
      }
    } catch (err) {
      console.error('加载作品集异常:', err)
      util.showError('加载异常: ' + (err.message || '网络错误'))
    } finally {
      util.hideLoading()
    }
  },

  filterAlbumsByCategory(albums, categoryId) {
    if (!categoryId) {
      return albums
    }
    return albums.filter(album => album.categoryId === categoryId)
  },

  selectCategory(e) {
    const categoryId = e.currentTarget.dataset.id
    this.setData({
      currentCategoryId: categoryId,
      filteredAlbums: this.filterAlbumsByCategory(this.data.albums, categoryId)
    })
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
          await this.loadAlbums()
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
