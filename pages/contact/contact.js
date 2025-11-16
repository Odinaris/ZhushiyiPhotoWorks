const util = require('../../utils/util.js')

Page({
  data: {
    contactInfo: {
      qaList: [],
      contacts: []
    },
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

  // 加载联系信息
  async loadContactInfo() {
    try {
      util.showLoading('加载中...')

      const contactInfo = await util.getWithCache('contactInfo', async () => {
        const r = await util.callFunction('getContactInfo')
        if (!r.ok) throw new Error(r.message || '加载失败')
        return r.data || {}
      }, 600000)

      if (contactInfo) {
        const hasData = (contactInfo.qaList && contactInfo.qaList.length > 0) ||
                       (contactInfo.contacts && contactInfo.contacts.length > 0) ||
                       contactInfo.workingHours ||
                       contactInfo.location

        this.setData({
          contactInfo,
          hasData,
          loading: false,
          loadError: false
        })
      }
    } catch (err) {
      console.error('加载联系信息失败:', err)
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

  // 复制文本
  copyText(e) {
    const text = e.currentTarget.dataset.text
    wx.setClipboardData({
      data: text,
      success: () => {
        util.showSuccess('已复制到剪贴板')
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

  // 分享
  onShareAppMessage() {
    return {
      title: '联系我 - 摄影作品',
      path: '/pages/contact/contact'
    }
  }
})
