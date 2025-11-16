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

  async onLoad() {
    await this.checkPermission()
    this.loadStats()
  },

  onShow() {
    // 设置自定义 TabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(3)
      // 强制刷新 TabBar 的管理员状态
      this.getTabBar().updateAdminStatus()
    }
    
    // 每次显示时刷新数据
    this.loadStats()
  },

  // 检查权限
  async checkPermission() {
    const isAdmin = await app.waitForUserRole()
    if (!isAdmin) {
      util.showError('无权限访问')
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 1500)
    }
  },

  // 加载统计数据
  async loadStats() {
    try {
      const r = await util.callFunction('getAdminStats')
      if (r.ok) {
        this.setData({ stats: r.data || {} })
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
