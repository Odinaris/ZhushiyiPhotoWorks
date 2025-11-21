const util = require('../../utils/util.js')

Page({
  data: {
    categories: [],
    categoriesWithAll: [], // 包含"全部"的完整分类列表
    currentCategoryId: '',
    currentCategoryName: '',
    currentIndex: 0, // 当前Swiper索引
    viewMode: 'single', // 'single' | 'double'
    loading: true,
    loadError: false,
    albumCache: {}, // 每个分类的缓存数据
    page: 1,
    pageSize: 10
  },

  onLoad(options) {
    // 处理从首页跳转过来的分类筛选
    let categoryId = options.categoryId
    let categoryName = options.categoryName ? decodeURIComponent(options.categoryName) : ''
    
    // 总是优先从缓存获取最新的分类参数（因为switchTab跳转会通过缓存传递）
    const categoryParams = wx.getStorageSync('category_params')
    if (categoryParams) {
      categoryId = categoryParams.categoryId
      categoryName = categoryParams.categoryName
      
      // 清除缓存，避免影响下次
      wx.removeStorageSync('category_params')
    }
    
    this.setData({
      currentCategoryId: categoryId || '',
      currentCategoryName: categoryName || '全部',
      viewMode: wx.getStorageSync('albums_viewMode') || 'single' // 读取视图模式设置
    })
    
    this.loadCategories()
  },

  onShow() {
    // 设置自定义 TabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected(1)
      // 强制刷新 TabBar 的管理员状态
      this.getTabBar().updateAdminStatus()
    }
    
    // 检查是否有新的分类参数（从首页跳转过来）
    const categoryParams = wx.getStorageSync('category_params')
    if (categoryParams) {
      // 清除缓存，避免影响下次
      wx.removeStorageSync('category_params')
      
      // 更新分类并跳转到对应位置
      const currentIndex = this.data.categoriesWithAll.findIndex(cat => cat._id === categoryParams.categoryId)
      if (currentIndex !== -1) {
        this.setData({
          currentCategoryId: categoryParams.categoryId,
          currentCategoryName: categoryParams.categoryName || '全部',
          currentIndex
        })
        
        // 加载该分类的作品集
        this.loadCategoryAlbums(categoryParams.categoryId)
      }
    }
    
    // 只有在首次加载时才加载分类，避免重复加载
    if (!this.data.categories || this.data.categories.length === 0) {
      this.loadCategories()
    }
  },

  // 加载分类列表
  async loadCategories() {
    try {
      const data = await util.getWithCache('categories', async () => {
        const r = await util.callFunction('getCategories')
        if (!r.ok) throw new Error(r.message || '加载失败')
        return r.data || []
      }, 600000)
      
      // 构建包含"全部"的完整分类列表
      const allCategory = {
        _id: '',
        name: '全部',
        albumCount: data.reduce((sum, cat) => sum + (cat.albumCount || 0), 0),
        albums: this.data.albumCache['']?.albums || [],
        hasMore: this.data.albumCache['']?.hasMore !== false,
        totalCount: data.reduce((sum, cat) => sum + (cat.albumCount || 0), 0)
      }
      
      const categoriesWithAll = [allCategory, ...data.map(cat => ({
        ...cat,
        albums: this.data.albumCache[cat._id]?.albums || [],
        hasMore: this.data.albumCache[cat._id]?.hasMore !== false,
        totalCount: cat.albumCount || 0
      }))]
      
      this.setData({ 
        categories: data || [], 
        categoriesWithAll 
      })
      
      // 更新当前索引
      const currentIndex = categoriesWithAll.findIndex(cat => cat._id === this.data.currentCategoryId)
      if (currentIndex !== -1) {
        this.setData({ currentIndex })
      }
      
      // 加载当前选中分类的数据
      this.loadCategoryAlbums(this.data.currentCategoryId)
      
    } catch (err) {
      console.error('加载分类失败:', err)
      this.setData({ loadError: true })
    }
  },





  // 加载指定分类的作品集
  async loadAlbumsForCategory(categoryId, page = 1) {
    try {
      this.setData({ loading: true })

      const params = {
        categoryId,
        page,
        pageSize: this.data.pageSize
      }
      
      const r = await util.callFunction('getAlbumsByCategory', params)

      if (r.ok) {
        const newAlbums = r.data || []
        const cacheKey = categoryId || ''
        const existingAlbums = this.data.albumCache[cacheKey]?.albums || []
        const albums = page === 1 ? newAlbums : [...existingAlbums, ...newAlbums]
        
        const hasMore = newAlbums.length >= this.data.pageSize
        
        // 如果是全部分类的第一页，更新实际总数
        if (categoryId === '' && page === 1 && r.totalCount !== undefined) {
          const categoriesWithAll = this.data.categoriesWithAll.map(cat => {
            if (cat._id === '') {
              return { ...cat, totalCount: r.totalCount }
            }
            return cat
          })
          this.setData({ categoriesWithAll })
        }
        
        // 更新数据
        this.updateCategoryData(categoryId, albums, hasMore, page)
        this.setData({ loading: false, loadError: false })
      } else {
        throw new Error(r.message || '加载失败')
      }
    } catch (err) {
      console.error('加载作品集失败:', err)
      util.showError('加载失败，请重试')
      this.setData({ loading: false, loadError: true })
    }
  },

  // 切换分类
  onCategoryChange(e) {
    const id = e.currentTarget.dataset.id
    const name = e.currentTarget.dataset.name || '全部作品'
    
    if (id === this.data.currentCategoryId) return

    this.setData({
      currentCategoryId: id,
      currentCategoryName: name
    })

    // 更新索引
    const currentIndex = this.data.categoriesWithAll.findIndex(cat => cat._id === id)
    this.setData({ currentIndex })
    
    // 加载该分类的作品集
    this.loadCategoryAlbums(id)
  },

  // 视图模式切换
  onViewModeChange(e) {
    const currentMode = this.data.viewMode
    const newMode = currentMode === 'single' ? 'double' : 'single'
    console.log('切换视图模式:', newMode)
    this.setData({ viewMode: newMode })
    // 保存到本地存储
    wx.setStorageSync('albums_viewMode', newMode)
  },

  // Swiper切换事件
  onSwiperChange(e) {
    const currentIndex = e.detail.current
    const category = this.data.categoriesWithAll[currentIndex]
    
    if (category && category._id !== this.data.currentCategoryId) {
      this.setData({
        currentIndex,
        currentCategoryId: category._id,
        currentCategoryName: category.name
      })
      
      // 加载该分类的作品集
      this.loadCategoryAlbums(category._id)
    }
  },

  // 加载指定分类的作品集
  async loadCategoryAlbums(categoryId) {
    const cacheKey = categoryId || ''
    const cache = this.data.albumCache[cacheKey]
    
    if (cache && cache.albums && cache.albums.length > 0) {
      // 使用缓存数据
      this.updateCategoryData(categoryId, cache.albums, cache.hasMore, cache.page || 1)
    } else {
      // 从服务器加载
      this.updateCategoryData(categoryId, [], true, 1)
      await this.loadAlbumsForCategory(categoryId, 1)
    }
  },

  // 更新分类数据
  updateCategoryData(categoryId, albums, hasMore, page) {
    const cacheKey = categoryId || ''
    
    // 更新缓存
    const albumCache = this.data.albumCache
    albumCache[cacheKey] = { albums, hasMore, page }
    
    // 更新分类列表中的数据
    const categoriesWithAll = this.data.categoriesWithAll.map(cat => {
      if (cat._id === categoryId) {
        return { ...cat, albums, hasMore, page }
      }
      return cat
    })
    
    this.setData({ albumCache, categoriesWithAll })
  },

  // 滚动到底部
  onReachBottom() {
    // 获取当前活跃分类的数据
    const currentCategory = this.data.categoriesWithAll[this.data.currentIndex]
    if (currentCategory && currentCategory.hasMore && !this.data.loading) {
      this.loadAlbumsForCategory(currentCategory._id, (currentCategory.page || 1) + 1)
    }
  },

  // 跳转到作品详情
  goToAlbumDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/album-detail/album-detail?id=${id}`
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadCategories()
    
    // 刷新当前分类的数据
    const currentCategory = this.data.categoriesWithAll[this.data.currentIndex]
    if (currentCategory) {
      this.loadAlbumsForCategory(currentCategory._id, 1).then(() => {
        wx.stopPullDownRefresh()
      })
    } else {
      wx.stopPullDownRefresh()
    }
  },

  onRetry() {
    this.loadCategories()
    
    // 重试当前分类的数据
    const currentCategory = this.data.categoriesWithAll[this.data.currentIndex]
    if (currentCategory) {
      this.loadAlbumsForCategory(currentCategory._id, 1)
    }
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '精彩摄影作品集',
      path: '/pages/albums/albums'
    }
  },

})