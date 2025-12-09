const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    banners: [],
    categories: [],
    featuredAlbums: [],
    loading: true,
    userInfo: null,
    loadError: false
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    // 设置自定义 TabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(0)
      // 强制刷新 TabBar 的管理员状态
      this.getTabBar().updateAdminStatus()
    }
    
    // 只有在数据为空或缓存过期时才重新加载
    if (this.data.loading || this.data.loadError || this.data.featuredAlbums.length === 0) {
      this.loadData()
    } else {
      // 检查缓存是否需要更新
      this.checkAndUpdateData()
    }
  },

  // 检查并更新数据（静默更新，不显示 loading）
  async checkAndUpdateData() {
    try {
      // 检查首页数据缓存
      const homeDataCached = util.getCache('homeData')
      const categoriesCached = util.getCache('categories')
      
      // 如果缓存都存在且未过期，则不更新
      if (homeDataCached !== null && categoriesCached !== null) {
        return
      }
      
      // 静默更新过期的缓存
      const updatePromises = []
      
      if (homeDataCached === null) {
        updatePromises.push(
          util.getWithCache('homeData', async () => {
            const r = await util.callFunction('getHomeData')
            if (!r.ok) throw new Error(r.message || '加载首页数据失败')
            return r.data
          }, 600000)
        )
      }
      
      if (categoriesCached === null) {
        updatePromises.push(
          util.getWithCache('categories', async () => {
            const r = await util.callFunction('getCategories')
            if (!r.ok) throw new Error(r.message || '加载分类失败')
            return r.data
          }, 60000)
        )
      }
      
      const results = await Promise.all(updatePromises)
      
      // 静默更新页面数据（如果需要的话）
      if (homeDataCached === null && results[0]) {
        const { banners, photographer, featuredAlbums } = results[0]
        this.setData({
          banners: banners || this.data.banners,
          photographer: photographer || this.data.photographer,
          featuredAlbums: featuredAlbums || this.data.featuredAlbums
        })
      }
      
      if (categoriesCached === null && results[1]) {
        this.setData({
          categories: results[1]
        })
      }
      
    } catch (err) {
      console.warn('静默更新数据失败:', err)
      // 静默失败，不影响用户体验
    }
  },

  // 加载首页数据
  async loadData() {
    try {
      // 只在页面初始加载或错误重试时显示 loading
      if (this.data.loading || this.data.loadError) {
        util.showLoading('加载中...')
      }
      
      // 并行加载首页数据和分类数据
      const [homeDataResult, categoriesResult] = await Promise.all([
        util.getWithCache('homeData', async () => {
          const r = await util.callFunction('getHomeData')
          if (!r.ok) throw new Error(r.message || '加载首页数据失败')
          return r.data
        }, 600000),
        util.getWithCache('categories', async () => {
          const r = await util.callFunction('getCategories')
          if (!r.ok) throw new Error(r.message || '加载分类失败')
          return r.data
        }, 60000) // 分类缓存1分钟，确保更新能及时显示
      ])

      const { banners, photographer, featuredAlbums } = homeDataResult || {}
      
      this.setData({
        banners: banners || [],
        photographer: photographer || {
          brandName: '朱适颐的摄影工作室',
          slogan: '记录每一个美好瞬间',
          styles: ['人像', '风光', '纪实']
        },
        featuredAlbums: featuredAlbums || [],
        categories: categoriesResult,
        loading: false,
        loadError: false
      })
      
      console.log('首页数据加载完成:', {
        bannersCount: (banners || []).length,
        categoriesCount: (categoriesResult || []).length,
        featuredAlbumsCount: (featuredAlbums || []).length,
        featuredAlbums: featuredAlbums || []
      })
      
      // 调试：检查数据结构
      console.log('homeDataResult详细内容:', homeDataResult)
      console.log('featuredAlbums详细内容:', featuredAlbums)
    } catch (err) {
      console.error('加载首页数据失败:', err)
      util.showError('加载失败，请重试')
      this.setData({ loading: false, loadError: true })
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

  // 跳转到分类作品列表
  goToCategoryAlbums(e) {
    const category = e.currentTarget.dataset.category
    
    if (!category) {
      wx.showToast({
        title: '分类信息错误',
        icon: 'none'
      })
      return
    }
    
    // albums 是 tabBar 页面，需要使用 switchTab
    // 使用小程序缓存机制传递分类参数
    const categoryParams = {
      categoryId: category._id || '', // 支持空字符串表示全部
      categoryName: category.name || '全部'
    }
    
    // 将分类参数存入缓存
    wx.setStorageSync('category_params', categoryParams)
    
    wx.switchTab({
      url: '/pages/albums/albums',
      fail: (err) => {
        console.error('跳转失败:', err)
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        })
      }
    })
  },

  // 跳转到作品页（查看全部）
  goToAllAlbums() {
    // 清除可能存在的分类缓存，确保显示全部
    wx.removeStorageSync('category_params')
    
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



  onRetry() {
    this.loadData()
  },



  // 下拉刷新
  onPullDownRefresh() {
    // 清除缓存，强制重新加载数据
    util.clearCache('homeData')
    util.clearCache('categories')
    
    // 重新加载数据
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
    }).catch(() => {
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
