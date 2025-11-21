# openId 白名单管理员权限 - 快速部署

## ✅ 适用范围

**适用于个人认证小程序和企业认证小程序**

- ✅ 无需任何额外授权
- ✅ 完全免费
- ✅ 实现简单
- ✅ openId 不会被提交到 Git（已加入 .gitignore）

---

## 🚀 部署步骤

### 第一步：获取管理员 openId

1. **使用微信开发者工具打开小程序**
2. 在首页右下角会看到 **"📋 获取我的 openId"** 按钮（仅开发环境显示）
3. 点击按钮，会弹出对话框显示您的 openId
4. 点击 **"复制"** 按钮复制到剪贴板

**控制台输出示例：**
```
============================================================
openId: oABCD-1234567890abcdefghijklmnopqrstuvwxyz
是否管理员: false
配置路径: cloudfunctions/admin.config.js
============================================================
```

---

### 第二步：配置 openId 白名单

编辑 `cloudfunctions/admin.config.js` 文件（如果不存在，复制 `admin.config.example.js` 为 `admin.config.js`）：

```javascript
module.exports = {
  ADMIN_OPENIDS: [
    'olg5x14n5AduM1nbbdUwypI7iies',  // Odinaris 的 openId
    'oEFGH-0987654321zyxwvutsrqpo'   // kkaazaz 的 openId
  ]
}
```

**⚠️ 重要说明**：
- 此文件已加入 `.gitignore`，不会被提交到 Git
- 所有管理员的 openId 都配置在这一个文件中
- 云函数会自动读取此配置文件

**格式说明**：
- ✅ 正确：`'oABCD-1234567890abcdefghijk'`（完整 openId）
- ❌ 错误：多余空格、引号不匹配、复制不完整

---

### 第三步：上传云函数

在微信开发者工具中：

1. 右键 `cloudfunctions/getUserRole` → **"上传并部署：云端安装依赖"**
2. 右键 `cloudfunctions/wxLogin` → **"上传并部署：云端安装依赖"**

等待上传完成（显示绿色勾号）。

---

### 第四步：测试功能

#### 测试管理员权限

1. **重新编译小程序**（点击工具栏的"编译"按钮）
2. 打开首页
3. 查看控制台输出：
   ```
   自动登录成功: {role: "admin", isAdmin: true, openId: "oABCD-..."}
   ```
4. ✅ 底部导航栏应显示 **"管理"** 标签（第4个）
5. 点击可进入管理后台

#### 测试普通用户

1. 用其他微信（非管理员）扫码预览
2. ✅ 底部导航栏只显示"首页"、"作品"、"联系我"三个标签
3. ✅ 看不到"管理"标签

---

## ✅ 部署完成检查清单

- [ ] 已获取所有管理员的 openId
- [ ] 已创建 `cloudfunctions/admin.config.js` 文件
- [ ] 已在 `admin.config.js` 中填写所有管理员 openId
- [ ] 已上传 `getUserRole` 云函数
- [ ] 已上传 `wxLogin` 云函数
- [ ] 已重新编译小程序
- [ ] 管理员测试通过（能看到底部"管理"标签）
- [ ] 普通用户测试通过（看不到"管理"标签）
- [ ] 确认 `admin.config.js` 不会被提交到 Git

---

## 🔧 常见问题

### 问题 1: 配置后仍然没有管理员权限

**检查清单**：
1. openId 是否复制完整（没有多余空格）
2. `admin.config.js` 文件是否存在
3. 云函数是否重新上传
4. 是否重新编译小程序
5. 查看云函数日志是否有报错

### 问题 2: 看不到调试按钮

**原因**：体验版和正式版不显示调试按钮，只在开发环境显示。

**解决方法**：使用微信开发者工具打开小程序。

### 问题 3: 如何添加新的管理员？

1. 新管理员使用开发者工具获取自己的 openId
2. 编辑 `cloudfunctions/admin.config.js`：
   ```javascript
   module.exports = {
     ADMIN_OPENIDS: [
       'oABCD-admin1',
       'oEFGH-admin2',
       'oIJKL-admin3'  // 新增管理员
     ]
   }
   ```
3. 重新上传两个云函数（`getUserRole` 和 `wxLogin`）
4. 重新编译小程序

### 问题 4: openId 会变化吗？

**不会**。同一用户在同一小程序中的 openId 是固定的，除非小程序被删除后重新创建。

### 问题 5: 团队协作时如何管理配置？

**方案 1（推荐）**：
- 团队内部共享 `admin.config.js` 文件（通过私密渠道）
- 每个开发者手动创建本地文件

**方案 2**：
- 在项目文档中记录所有管理员 openId
- 每个开发者根据文档配置

**方案 3**：
- 使用环境变量或密钥管理工具

---

## 📁 文件结构

```
cloudfunctions/
├── admin.config.js          # 管理员配置（不提交到Git）✨
├── admin.config.example.js  # 配置示例文件（提交到Git）
├── getUserRole/
│   └── index.js            # 引用 admin.config.js
└── wxLogin/
    └── index.js            # 引用 admin.config.js
```

---

## 🎯 核心优势

- ✅ **无需授权**：用户打开即自动判断
- ✅ **适用广泛**：个人和企业小程序都可用
- ✅ **实现简单**：只需配置白名单即可
- ✅ **完全免费**：无任何额外费用
- ✅ **安全保护**：openId 不会泄露到 Git
- ✅ **动态显示**：管理标签仅管理员可见

---

**祝部署顺利！** 🎉

如有问题，请查看控制台日志或云函数日志排查。


