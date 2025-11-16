const app = getApp()
const util = require('../../../utils/util.js')

Page({
  data: {
    stats: {
      albumCount: 0,
      categoryCount: 0,
      bannerCount: 0,
      totalViews: 0
    }
  },

  onLoad() {
    this.checkPermission()
    this.loadStats()
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadStats()
  },

  // 检查权限
  checkPermission() {
    if (!app.globalData.isAdmin) {
      util.showError('无权限访问')
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    }
  },

  // 加载统计数据
  async loadStats() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getAdminStats'
      })

      if (res.result && res.result.success) {
        this.setData({
          stats: res.result.data || {}
        })
      }
    } catch (err) {
      console.error('加载统计数据失败:', err)
    }
  },

  // 导航
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
