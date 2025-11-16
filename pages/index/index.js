const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    banners: [],
    photographer: {},
    featuredAlbums: [],
    loading: true,
    isAdmin: false
  },

  onLoad() {
    this.loadData()
    this.checkAdminStatus()
  },

  onShow() {
    // 每次显示时检查管理员权限
    this.checkAdminStatus()
  },

  // 检查管理员状态
  async checkAdminStatus() {
    // 等待用户角色加载完成
    const isAdmin = await app.waitForUserRole()
    this.setData({
      isAdmin: isAdmin
    })
    console.log('首页管理员状态:', isAdmin)
  },

  // 加载首页数据
  async loadData() {
    try {
      util.showLoading('加载中...')
      
      const res = await wx.cloud.callFunction({
        name: 'getHomeData'
      })

      if (res.result && res.result.success) {
        const { banners, photographer, featuredAlbums } = res.result.data
        this.setData({
          banners: banners || [],
          photographer: photographer || {
            brandName: '朱适颐的摄影工作室',
            slogan: '记录每一个美好瞬间',
            styles: ['人像', '风光', '纪实']
          },
          featuredAlbums: featuredAlbums || [],
          loading: false
        })
      } else {
        throw new Error(res.result?.message || '加载失败')
      }
    } catch (err) {
      console.error('加载首页数据失败:', err)
      util.showError('加载失败，请重试')
      this.setData({ loading: false })
    } finally {
      util.hideLoading()
    }
  },

  // 轮播图点击
  onBannerTap(e) {
    const item = e.currentTarget.dataset.item
    if (item.linkType === 'album' && item.linkId) {
      wx.navigateTo({
        url: `/pages/album-detail/album-detail?id=${item.linkId}`
      })
    } else if (item.linkType === 'external' && item.linkUrl) {
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(item.linkUrl)}`
      })
    }
  },

  // 跳转到作品页
  goToAlbums() {
    wx.switchTab({
      url: '/pages/albums/albums'
    })
  },

  // 跳转到作品详情
  goToAlbumDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/album-detail/album-detail?id=${id}`
    })
  },

  // 跳转到管理后台
  goToAdmin() {
    wx.navigateTo({
      url: '/pages/admin/dashboard/dashboard'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `${this.data.photographer.brandName || '摄影作品'} - ${this.data.photographer.slogan || '记录美好瞬间'}`,
      path: '/pages/index/index',
      imageUrl: this.data.banners[0]?.imageUrl || ''
    }
  },

  onShareTimeline() {
    return {
      title: `${this.data.photographer.brandName || '摄影作品'}`,
      query: '',
      imageUrl: this.data.banners[0]?.imageUrl || ''
    }
  }
})
