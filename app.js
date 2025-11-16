// app.js
const envConfig = require('./env.config.js')

App({
  globalData: {
    userInfo: null,
    userRole: 'user', // user | admin
    isAdmin: false,
    cloudEnvId: envConfig.cloudEnvId, // 从配置文件读取
    userRoleReady: false // 用户角色是否已加载完成
  },

  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: this.globalData.cloudEnvId,
        traceUser: true
      })
    }

    // 自动登录（不需要用户授权）
    this.autoLogin()
  },

  // 自动登录（静默登录，不需要用户授权）
  async autoLogin() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserRole'
      })
      
      if (res.result && res.result.success) {
        this.globalData.userRole = res.result.data.role || 'user'
        this.globalData.isAdmin = res.result.data.isAdmin || false
        this.globalData.userInfo = res.result.data.userInfo
        this.globalData.userRoleReady = true
        
        // 触发所有等待的回调
        if (this.userRoleCallbacks && this.userRoleCallbacks.length > 0) {
          this.userRoleCallbacks.forEach(callback => {
            callback(this.globalData.isAdmin)
          })
          this.userRoleCallbacks = []
        }
        
        // 通知自定义 TabBar 更新
        this.updateTabBar()
      }
    } catch (err) {
      console.error('自动登录失败:', err)
      // 默认为普通用户
      this.globalData.userRole = 'user'
      this.globalData.isAdmin = false
      this.globalData.userRoleReady = true
      
      // 触发所有等待的回调
      if (this.userRoleCallbacks && this.userRoleCallbacks.length > 0) {
        this.userRoleCallbacks.forEach(callback => {
          callback(false)
        })
        this.userRoleCallbacks = []
      }
      
      // 通知自定义 TabBar 更新
      this.updateTabBar()
    }
  },

  // 更新自定义 TabBar
  updateTabBar() {
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar()
      if (tabBar) {
        tabBar.setData({
          isAdmin: this.globalData.isAdmin
        })
      }
    }
  },

  // 获取用户角色（保留兼容性）
  async getUserRole() {
    return this.autoLogin()
  },

  // 检查是否是管理员
  checkAdmin() {
    return this.globalData.isAdmin
  },

  // 等待用户角色加载完成（支持多个监听者）
  waitForUserRole() {
    return new Promise((resolve) => {
      if (this.globalData.userRoleReady) {
        resolve(this.globalData.isAdmin)
      } else {
        // 支持多个回调
        if (!this.userRoleCallbacks) {
          this.userRoleCallbacks = []
        }
        this.userRoleCallbacks.push(resolve)
        
        // 设置超时
        setTimeout(() => {
          resolve(this.globalData.isAdmin)
        }, 5000)
      }
    })
  }
})
