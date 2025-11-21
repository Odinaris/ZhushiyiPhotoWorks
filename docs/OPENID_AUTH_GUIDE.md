# openId 白名单管理员认证方案

## 方案概述

本小程序使用 **openId 白名单** 方案判断管理员权限，适用于**个人认证小程序**。

### 核心原理

1. 用户打开小程序时自动静默登录（无需授权）
2. 云函数获取用户的 `openId`
3. 判断 `openId` 是否在管理员白名单中
4. 动态显示/隐藏管理后台入口

### 优势

- ✅ 适用于个人认证小程序
- ✅ 无需用户手动授权
- ✅ 实现简单可靠
- ✅ 完全免费

### 劣势

- ❌ openId 较长难记（如 `oABCD-xxxxxxxxxxxx`）
- ❌ 需要管理员先登录获取 openId

---

## 快速部署步骤

### 步骤 1：获取管理员 openId

1. **使用开发者工具预览小程序**
2. 在首页右下角会看到 **"📋 获取我的 openId"** 按钮（仅开发环境显示）
3. 点击按钮，会弹出对话框显示您的 openId
4. 点击 **"复制"** 按钮复制到剪贴板
5. 同时也可以在控制台查看完整信息

**示例输出：**
```
============================================================
openId: oABCD-1234567890abcdefghijklmnopqrstuvwxyz
是否管理员: false
配置路径: cloudfunctions/wxLogin/index.js 和 cloudfunctions/getUserRole/index.js
============================================================
```

### 步骤 2：配置云函数白名单

编辑 `cloudfunctions/admin.config.js` 文件（如果不存在，复制 `admin.config.example.js` 为 `admin.config.js`）：

```javascript
module.exports = {
  ADMIN_OPENIDS: [
    'oABCD-1234567890abcdefghijklmnopqrstuvwxyz',  // 管理员1 openId
    'oEFGH-0987654321zyxwvutsrqponmlkjihgfedcba'   // 管理员2 openId
  ]
}
```

**重要说明：**
- ✅ 此文件已加入 `.gitignore`，不会被提交到 Git
- ✅ 云函数会自动读取此配置
- ✅ 所有管理员配置在一个文件中，无需修改云函数代码

### 步骤 3：上传云函数

在微信开发者工具中：

1. 右键点击 `cloudfunctions/wxLogin` → **上传并部署：云端安装依赖**
2. 右键点击 `cloudfunctions/getUserRole` → **上传并部署：云端安装依赖**
3. 等待上传完成

### 步骤 4：测试验证

1. **重新编译小程序**（点击工具栏的"编译"按钮）
2. 打开首页
3. 查看控制台输出：
   ```
   自动登录成功: {role: "admin", isAdmin: true, openId: "oABCD-..."}
   首页管理员状态: {isAdmin: true, openId: "oABCD-..."}
   ```
4. 如果配置正确，应能看到：
   - 底部导航栏显示 **"管理"** 标签
   - 点击可进入后台管理

---

## 技术细节

### 文件修改清单

| 文件路径 | 修改内容 |
|---------|---------|
| `cloudfunctions/admin.config.js` | 新增：管理员 openId 配置文件 ✨ |
| `cloudfunctions/admin.config.example.js` | 新增：配置示例文件 |
| `cloudfunctions/wxLogin/index.js` | 改为读取 admin.config.js |
| `cloudfunctions/getUserRole/index.js` | 改为读取 admin.config.js |
| `.gitignore` | 添加 admin.config.js |
| `app.json` | 添加自定义 TabBar 配置 |
| `custom-tab-bar/*` | 新增：自定义 TabBar 组件 |
| `app.js` | 移除手机号相关逻辑 |
| `pages/index/index.js` | 添加 `showMyOpenId()` 辅助方法，移除管理入口 |
| `pages/index/index.wxml` | 添加开发环境调试按钮，移除管理按钮 |
| `pages/index/index.wxss` | 更新样式 |
| `pages/albums/albums.js` | 添加 TabBar 选中状态 |
| `pages/contact/contact.js` | 添加 TabBar 选中状态 |
| `pages/admin/dashboard/dashboard.js` | 添加 TabBar 选中状态 |

### 核心代码逻辑

**配置文件：**
```javascript
// cloudfunctions/admin.config.js
module.exports = {
  ADMIN_OPENIDS: ['oABCD-xxx', 'oEFGH-yyy']
}
```

**云函数读取配置：**
```javascript
// cloudfunctions/getUserRole/index.js
let adminConfig
try {
  adminConfig = require('../admin.config.js')
} catch (e) {
  console.warn('未找到 admin.config.js')
  adminConfig = { ADMIN_OPENIDS: [] }
}

const ADMIN_OPENIDS = adminConfig.ADMIN_OPENIDS || []

exports.main = async (event, context) => {
  const openid = wxContext.OPENID
  const isAdmin = ADMIN_OPENIDS.includes(openid)
  // ...
}
```

**自定义 TabBar：**
```javascript
// custom-tab-bar/index.js
list: [
  { pagePath: "/pages/index/index", text: "首页" },
  { pagePath: "/pages/albums/albums", text: "作品" },
  { pagePath: "/pages/contact/contact", text: "联系我" },
  { 
    pagePath: "/pages/admin/dashboard/dashboard", 
    text: "管理",
    adminOnly: true  // 仅管理员可见
  }
]
```

### 自动登录流程

```
用户打开小程序
    ↓
app.js onLaunch()
    ↓
调用 wx.cloud.callFunction({ name: 'getUserRole' })
    ↓
云函数获取 openId 并判断是否在白名单
    ↓
返回 isAdmin: true/false
    ↓
设置 globalData.isAdmin
    ↓
页面根据 isAdmin 动态显示管理入口
```

---

## 常见问题

### Q1: 为什么开发环境看不到调试按钮？

**A:** 请确保在微信开发者工具中打开小程序，体验版和正式版不会显示该按钮。

### Q2: 配置后仍然没有管理员权限？

**A:** 检查以下几点：
1. openId 是否复制完整（没有多余空格）
2. 两个云函数的白名单是否一致
3. 云函数是否重新上传
4. 是否重新编译小程序

### Q3: 如何添加多个管理员？

**A:** 在数组中添加多个 openId 即可：
```javascript
const ADMIN_OPENIDS = [
  'oABCD-admin1',
  'oEFGH-admin2',
  'oIJKL-admin3'
]
```

### Q4: openId 会变化吗？

**A:** 不会。同一用户在同一小程序中的 openId 是固定的，除非小程序被删除后重新创建。

### Q5: 生产环境如何部署？

**A:** 
1. 在开发环境获取所有管理员的 openId
2. 配置到云函数白名单
3. 上传云函数
4. 提交代码审核
5. 发布小程序

调试按钮不会在体验版和正式版中显示，不影响用户体验。

---

## 安全建议

1. **妥善保管 openId**：虽然 openId 本身不敏感，但不要公开分享
2. **定期审查白名单**：及时移除离职管理员的 openId
3. **使用版本控制**：将白名单配置记录在团队文档中，避免遗忘
4. **备份云函数代码**：定期备份云函数配置

---

## 升级到其他方案

如果后续小程序升级为企业认证，可以考虑迁移到：

- **手机号白名单方案**：更直观易记
- **企业微信方案**：集成企业微信身份验证
- **自定义登录方案**：连接企业内部系统

迁移成本较低，只需修改云函数逻辑即可。
