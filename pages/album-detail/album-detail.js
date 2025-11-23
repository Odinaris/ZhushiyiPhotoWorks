const util = require('../../utils/util.js')

Page({
  data: {
    albumId: '',
    album: {
      images: []
    },
    loading: true,
    loadError: false,
    viewMode: 'grid', // 'grid' 瀑布流模式, 'list' 单栏模式
    imageHeights: {} // 存储每张图片的高度
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ albumId: options.id })
      this.loadAlbumDetail()
      this.updateViewCount()
    } else {
      util.showError('参数错误')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 加载作品集详情
  async loadAlbumDetail() {
    try {
      util.showLoading('加载中...')

      const r = await util.callFunction('getAlbumDetail', { albumId: this.data.albumId })
      if (r.ok) {
        this.setData({
          album: r.data || { images: [] },
          loading: false,
          loadError: false
        })
      } else {
        throw new Error(r.message || '加载失败')
      }
    } catch (err) {
      console.error('加载作品集详情失败:', err)
      util.showError('加载失败')
      this.setData({ loading: false, loadError: true })
    } finally {
      util.hideLoading()
    }
  },

  // 更新浏览次数
  async updateViewCount() {
    try {
      await util.callFunction('updateAlbumStats', { albumId: this.data.albumId, type: 'view' })
    } catch (err) {
      console.error('更新浏览次数失败:', err)
    }
  },

  // 更新分享次数
  async updateShareCount() {
    try {
      await util.callFunction('updateAlbumStats', { albumId: this.data.albumId, type: 'share' })
    } catch (err) {
      console.error('更新分享次数失败:', err)
    }
  },

  // 切换浏览模式
  toggleViewMode() {
    const newMode = this.data.viewMode === 'grid' ? 'list' : 'grid'
    this.setData({
      viewMode: newMode
    })
  },

  // 图片加载完成事件
  onImageLoad(e) {
    const { index } = e.currentTarget.dataset
    const { width, height } = e.detail
    
    // 根据模式计算容器宽度
    const screenWidth = wx.getSystemInfoSync().windowWidth
    const padding = 4 // 左右各2rpx
    const containerWidth = this.data.viewMode === 'grid' ? 
      (screenWidth - padding - 2) / 2 : // 瀑布流模式：双栏，减去2rpx间距
      (screenWidth - padding) // 单栏模式：全宽
    
    // 计算图片高度
    const imageHeight = (height / width) * containerWidth
    const heights = this.data.imageHeights
    heights[index] = imageHeight
    
    this.setData({
      imageHeights: heights
    })
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index
    const urls = this.data.album.images.map(img => img.url)
    
    wx.previewImage({
      urls,
      current: urls[index]
    })
  },

  // 分享给好友
  onShareAppMessage() {
    this.updateShareCount()
    
    return {
      title: this.data.album.title || '精彩摄影作品',
      path: `/pages/album-detail/album-detail?id=${this.data.albumId}`,
      imageUrl: this.data.album.coverImage || this.data.album.images[0]?.url || ''
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    this.updateShareCount()
    
    return {
      title: this.data.album.title || '精彩摄影作品',
      query: `id=${this.data.albumId}`,
      imageUrl: this.data.album.coverImage || this.data.album.images[0]?.url || ''
    }
  }
  ,
  onRetry() {
    this.loadAlbumDetail()
  }
})
