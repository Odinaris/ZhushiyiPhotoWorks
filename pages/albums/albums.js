const util = require('../../utils/util.js')

Page({
  data: {
    categories: [],
    albums: [],
    currentCategoryId: '',
    currentCategoryName: '',
    totalCount: 0,
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: true
  },

  onLoad() {
    this.loadCategories()
    this.loadAlbums()
  },

  // 加载分类列表
  async loadCategories() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getCategories'
      })

      if (res.result && res.result.success) {
        this.setData({
          categories: res.result.data || []
        })
        this.calculateTotalCount()
      }
    } catch (err) {
      console.error('加载分类失败:', err)
    }
  },

  // 计算总数
  calculateTotalCount() {
    const total = this.data.categories.reduce((sum, cat) => sum + (cat.albumCount || 0), 0)
    this.setData({ totalCount: total })
  },

  // 加载作品集列表
  async loadAlbums(refresh = false) {
    if (this.data.loading && !refresh) return

    try {
      this.setData({ loading: true })

      const page = refresh ? 1 : this.data.page
      
      const res = await wx.cloud.callFunction({
        name: 'getAlbumsByCategory',
        data: {
          categoryId: this.data.currentCategoryId,
          page,
          pageSize: this.data.pageSize
        }
      })

      if (res.result && res.result.success) {
        const newAlbums = res.result.data || []
        const albums = refresh ? newAlbums : [...this.data.albums, ...newAlbums]
        
        this.setData({
          albums,
          page: page,
          hasMore: newAlbums.length >= this.data.pageSize,
          loading: false
        })
      } else {
        throw new Error(res.result?.message || '加载失败')
      }
    } catch (err) {
      console.error('加载作品集失败:', err)
      util.showError('加载失败，请重试')
      this.setData({ loading: false })
    }
  },

  // 切换分类
  onCategoryChange(e) {
    const id = e.currentTarget.dataset.id
    const name = e.currentTarget.dataset.name || '全部作品'
    
    if (id === this.data.currentCategoryId) return

    this.setData({
      currentCategoryId: id,
      currentCategoryName: name,
      albums: [],
      page: 1,
      hasMore: true
    })

    this.loadAlbums(true)
  },

  // 滚动到底部
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      })
      this.loadAlbums()
    }
  },

  // 跳转到作品详情
  goToAlbumDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/album-detail/album-detail?id=${id}`
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadCategories()
    this.loadAlbums(true).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '精彩摄影作品集',
      path: '/pages/albums/albums'
    }
  }
})
