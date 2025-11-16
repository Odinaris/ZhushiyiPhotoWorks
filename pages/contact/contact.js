const util = require('../../utils/util.js')

Page({
  data: {
    contactInfo: {
      qaList: [],
      contacts: []
    },
    loading: true,
    hasData: false
  },

  onLoad() {
    this.loadContactInfo()
  },

  // 加载联系信息
  async loadContactInfo() {
    try {
      util.showLoading('加载中...')

      const res = await wx.cloud.callFunction({
        name: 'getContactInfo'
      })

      if (res.result && res.result.success) {
        const contactInfo = res.result.data || {}
        const hasData = (contactInfo.qaList && contactInfo.qaList.length > 0) ||
                       (contactInfo.contacts && contactInfo.contacts.length > 0) ||
                       contactInfo.workingHours ||
                       contactInfo.location

        this.setData({
          contactInfo,
          hasData,
          loading: false
        })
      } else {
        throw new Error(res.result?.message || '加载失败')
      }
    } catch (err) {
      console.error('加载联系信息失败:', err)
      util.showError('加载失败')
      this.setData({ loading: false })
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

  // 分享
  onShareAppMessage() {
    return {
      title: '联系我 - 摄影作品',
      path: '/pages/contact/contact'
    }
  }
})
