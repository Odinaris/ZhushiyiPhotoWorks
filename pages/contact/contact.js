const util = require('../../utils/util.js')

Page({
  data: {
    photographerInfo: {},
    loading: true,
    hasData: false,
    loadError: false
  },

  onLoad() {
    this.loadContactInfo()
  },

  onShow() {
    // 设置自定义 TabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(2)
      // 强制刷新 TabBar 的管理员状态
      this.getTabBar().updateAdminStatus()
    }
    // 返回时刷新联系信息（利用缓存避免多余开销）
    this.loadContactInfo()
  },

  // 加载摄影师信息
  async loadContactInfo() {
    try {
      util.showLoading('加载中...')
      const r = await util.callFunction('getPhotographerInfo')
      if (!r.ok) throw new Error(r.message || '加载失败')
      const photographerInfo = r.data || {}
      
      // 统一处理styles为数组格式
      if (photographerInfo.styles) {
        if (typeof photographerInfo.styles === 'string') {
          photographerInfo.styles = photographerInfo.styles.split(',').map(s => s.trim()).filter(s => s)
        } else if (Array.isArray(photographerInfo.styles)) {
          photographerInfo.styles = photographerInfo.styles.map(s => String(s).trim()).filter(s => s)
        }
      }
      
      const hasData = photographerInfo.brandName || 
                     photographerInfo.slogan || 
                     photographerInfo.location || 
                     photographerInfo.introduction ||
                     photographerInfo.phone ||
                     photographerInfo.wechat ||
                     photographerInfo.email ||
                     (photographerInfo.styles && photographerInfo.styles.length > 0)

      this.setData({
        photographerInfo,
        hasData,
        loading: false,
        loadError: false
      })
    } catch (err) {
      console.error('加载摄影师信息失败:', err)
      util.showError('加载失败')
      this.setData({ loading: false, loadError: true })
    } finally {
      util.hideLoading()
    }
  },

  // 拨打电话
  makePhoneCall(e) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone
    }).catch(err => {
      console.error('拨打电话失败:', err)
    })
  },

  // 复制微信号
  copyWechat(e) {
    const wechat = e.currentTarget.dataset.wechat
    wx.setClipboardData({
      data: wechat,
      success: () => {
        util.showSuccess('微信号已复制')
      }
    })
  },

  // 复制邮箱
  copyEmail(e) {
    const email = e.currentTarget.dataset.email
    wx.setClipboardData({
      data: email,
      success: () => {
        util.showSuccess('邮箱地址已复制')
      }
    })
  },



  // 下拉刷新
  onPullDownRefresh() {
    this.loadContactInfo().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onRetry() {
    this.loadContactInfo()
  },

  onLogoLoad() {
    console.log('Logo加载成功')
  },

  onLogoError(e) {
    console.error('Logo加载失败:', e)
    this.setData({
      'photographerInfo.logo': ''
    })
  },

  // 分享
  onShareAppMessage(res) {
    const photographerInfo = this.data.photographerInfo
    return {
      title: photographerInfo.brandName || '摄影作品',
      path: '/pages/contact/contact',
      imageUrl: photographerInfo.logo || '',
      success: function() {
        console.log('分享成功')
      },
      fail: function(err) {
        console.log('分享失败', err)
      }
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const photographerInfo = this.data.photographerInfo
    return {
      title: photographerInfo.brandName || '摄影作品',
      query: '',
      imageUrl: photographerInfo.logo || ''
    }
  }
})
