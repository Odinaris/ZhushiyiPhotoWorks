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

    // 获取用户角色
    this.getUserRole()
  },

  // 获取用户角色
  async getUserRole() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserRole'
      })
      
      if (res.result && res.result.success) {
        this.globalData.userRole = res.result.data.role || 'user'
        this.globalData.isAdmin = res.result.data.role === 'admin'
        this.globalData.userInfo = res.result.data.userInfo
        this.globalData.userRoleReady = true
        
        // 触发全局事件，通知页面用户角色已加载
        if (this.userRoleCallback) {
          this.userRoleCallback(this.globalData.isAdmin)
        }
        
        console.log('用户角色加载完成:', this.globalData.userRole, 'isAdmin:', this.globalData.isAdmin)
      }
    } catch (err) {
      console.error('获取用户角色失败:', err)
      // 默认为普通用户
      this.globalData.userRole = 'user'
      this.globalData.isAdmin = false
      this.globalData.userRoleReady = true
    }
  },

  // 检查是否是管理员
  checkAdmin() {
    return this.globalData.isAdmin
  },

  // 等待用户角色加载完成
  waitForUserRole() {
    return new Promise((resolve) => {
      if (this.globalData.userRoleReady) {
        resolve(this.globalData.isAdmin)
      } else {
        this.userRoleCallback = resolve
        // 设置超时
        setTimeout(() => {
          resolve(this.globalData.isAdmin)
        }, 3000)
      }
    })
  }
})
