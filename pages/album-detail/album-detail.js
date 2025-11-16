const util = require('../../utils/util.js')

Page({
  data: {
    albumId: '',
    album: {
      images: []
    },
    loading: true,
    loadError: false
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
