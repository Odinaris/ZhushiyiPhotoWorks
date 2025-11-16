const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    banners: [],
    photographer: {},
    featuredAlbums: [],
    loading: true,
    userInfo: null,
    showDebugOpenId: false // 是否显示 openId 调试按钮（仅开发环境）
  },

  onLoad() {
    this.loadData()
    
    // 开发环境显示调试按钮
    const accountInfo = wx.getAccountInfoSync()
    this.setData({
      showDebugOpenId: accountInfo.miniProgram.envVersion === 'develop'
    })
  },

  onShow() {
    // 设置自定义 TabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(0)
      // 强制刷新 TabBar 的管理员状态
      this.getTabBar().updateAdminStatus()
    }
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

  // 显示完整调试信息
  showDebugInfo() {
    const userInfo = app.globalData.userInfo
    const isAdmin = app.globalData.isAdmin
    const userRoleReady = app.globalData.userRoleReady
    
    let debugInfo = `=== 调试信息 ===\n`
    debugInfo += `环境: ${wx.getAccountInfoSync().miniProgram.envVersion}\n`
    debugInfo += `角色已加载: ${userRoleReady}\n`
    debugInfo += `是否管理员: ${isAdmin}\n`
    debugInfo += `角色: ${app.globalData.userRole}\n`
    debugInfo += `openId: ${userInfo?._openid || '未获取'}\n\n`
    
    // TabBar 状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      const tabBar = this.getTabBar()
      debugInfo += `TabBar 存在: 是\n`
      debugInfo += `TabBar isAdmin: ${tabBar.data.isAdmin}\n`
    } else {
      debugInfo += `TabBar 存在: 否\n`
    }
    
    wx.showModal({
      title: '状态调试',
      content: debugInfo,
      confirmText: '复制 openId',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm && userInfo?._openid) {
          wx.setClipboardData({
            data: userInfo._openid,
            success: () => {
              wx.showToast({ title: 'openId 已复制', icon: 'success' })
            }
          })
        }
      }
    })
    
    // 同时输出到控制台
    console.log('========== 完整调试信息 ==========')
    console.log(debugInfo)
    console.log('app.globalData:', app.globalData)
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      console.log('TabBar.data:', this.getTabBar().data)
    }
    console.log('===================================')
  },

  // 辅助工具：显示当前用户的 openId（用于配置白名单）
  async showMyOpenId() {
    const userInfo = app.globalData.userInfo
    
    if (userInfo && userInfo._openid) {
      const openId = userInfo._openid
      
      wx.showModal({
        title: '您的 openId',
        content: `${openId}\n\n当前角色: ${app.globalData.isAdmin ? '管理员' : '普通用户'}\n\n请将此 openId 复制到云函数白名单中`,
        confirmText: '复制',
        cancelText: '关闭',
        success: (modalRes) => {
          if (modalRes.confirm) {
            wx.setClipboardData({
              data: openId,
              success: () => {
                wx.showToast({
                  title: '已复制到剪贴板',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
      
      console.log('='.repeat(60))
      console.log('openId:', openId)
      console.log('是否管理员:', app.globalData.isAdmin)
      console.log('配置路径: cloudfunctions/wxLogin/index.js 和 cloudfunctions/getUserRole/index.js')
      console.log('='.repeat(60))
    } else {
      wx.showToast({
        title: '获取 openId 失败',
        icon: 'none'
      })
    }
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
