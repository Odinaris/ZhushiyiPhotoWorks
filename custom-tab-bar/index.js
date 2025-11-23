const app = getApp()

Component({
  data: {
    selected: 0,
    color: "#DDDDDD",
    selectedColor: "#FFFFFF",
    backgroundColor: "#000000",
    isAdmin: false,
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        iconPath: "/images/tab-home.png",
        selectedIconPath: "/images/tab-home-active.png"
      },
      {
        pagePath: "/pages/albums/albums",
        text: "作品",
        iconPath: "/images/tab-album.png",
        selectedIconPath: "/images/tab-album-active.png"
      },
      {
        pagePath: "/pages/contact/contact",
        text: "关于",
        iconPath: "/images/tab-contact.png",
        selectedIconPath: "/images/tab-contact-active.png"
      },
      {
        pagePath: "/pages/admin/dashboard/dashboard",
        text: "管理",
        iconPath: "/images/tab-manage.png",
        selectedIconPath: "/images/tab-manage-active.png",
        adminOnly: true // 标记为管理员专属
      }
    ]
  },

  attached() {
    // 立即尝试获取状态
    this.updateAdminStatus()
    // 等待用户角色加载完成
    this.checkAdminStatus()
  },

  pageLifetimes: {
    show() {
      // 每次显示时更新状态
      this.updateAdminStatus()
    }
  },

  methods: {
    // 立即更新管理员状态（不等待）
    updateAdminStatus() {
      if (app && app.globalData) {
        this.setData({
          isAdmin: app.globalData.isAdmin || false
        })
      }
    },

    // 等待并更新管理员状态
    async checkAdminStatus() {
      try {
        // 等待用户角色加载
        const isAdmin = await app.waitForUserRole()
        this.setData({
          isAdmin: isAdmin
        })
      } catch (err) {
        console.error('TabBar 获取管理员状态失败:', err)
        this.setData({
          isAdmin: false
        })
      }
    },

    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      
      wx.switchTab({ url })
    },

    // 供页面调用，更新选中状态
    updateSelected(index) {
      this.setData({
        selected: index
      })
    }
  }
})
