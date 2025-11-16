# 更新日志

## [2024-11-16] - 管理员权限改造（openId 白名单）

### ✨ 新增功能

1. **openId 白名单管理员认证**
   - 改用 openId 白名单方案，适用于个人认证小程序
   - 无需用户手动授权，自动静默登录
   - 配置文件独立管理，不会泄露到 Git

2. **自定义底部导航栏**
   - 管理后台入口移至底部 TabBar
   - 管理标签仅对管理员可见
   - 动态显示/隐藏，提升用户体验

3. **开发辅助工具**
   - 首页添加"获取我的 openId"按钮（仅开发环境）
   - 首页添加"状态调试"按钮（仅开发环境）
   - 一键复制 openId 到剪贴板

### 🔒 安全改进

1. **配置文件架构优化**
   - 每个云函数独立配置：`cloudfunctions/{函数名}/admin.config.js`
   - 云函数从本地目录读取配置 `require('./admin.config.js')`
   - 上传云函数时自动包含配置文件
   - 添加到 `.gitignore`，防止泄露

2. **权限验证优化**
   - 云函数自动读取配置文件
   - 容错处理：配置文件缺失时使用空白名单
   - 统一配置源，避免不一致

### 🐛 问题修复

1. **修复管理入口不显示问题**
   - 问题：云函数引用父目录配置文件，上传时未包含
   - 解决：将配置文件放入云函数目录内
   - 影响：管理员现在可正常看到管理入口

2. **优化 TabBar 时序问题**
   - 多回调支持：`app.waitForUserRole()` 支持多个监听者
   - 主动更新：登录成功后主动通知 TabBar
   - 双重保障：attached + show 生命周期都会更新状态

### 🎨 UI 改进

1. **移除首页管理按钮**
   - 原右上角"⚙️ 管理后台"按钮已移除
   - 改为底部 TabBar 显示

2. **TabBar 优化**
   - 使用自定义 TabBar 组件
   - 支持动态显示标签
   - 图标已存在（`tab-manage.png` 和 `tab-manage-active.png`）

### 📝 文档更新

1. **新增文档**
   - `ADMIN_FIX.md` - 管理入口问题修复指南
   - `cloudfunctions/README.md` - 云函数配置说明

2. **更新文档**
   - `DEPLOY_STEPS.md` - 更新部署流程
   - `OPENID_AUTH_GUIDE.md` - 完整技术文档
   - `TROUBLESHOOTING.md` - 问题排查清单

### 📦 文件变更

#### 新增文件
- `cloudfunctions/getUserRole/admin.config.js` - 管理员配置（不提交）
- `cloudfunctions/getUserRole/admin.config.example.js` - 配置示例
- `cloudfunctions/wxLogin/admin.config.js` - 管理员配置（不提交）
- `cloudfunctions/wxLogin/admin.config.example.js` - 配置示例
- `custom-tab-bar/*` - 自定义 TabBar 组件
- `ADMIN_FIX.md` - 修复指南

#### 修改文件
- `cloudfunctions/getUserRole/index.js` - 改为读取本地配置
- `cloudfunctions/wxLogin/index.js` - 改为读取本地配置
- `.gitignore` - 添加云函数配置文件忽略规则
- `app.json` - 添加自定义 TabBar
- `app.js` - 优化登录流程和 TabBar 更新机制
- `custom-tab-bar/index.js` - 优化状态更新逻辑
- `pages/index/index.js` - 添加状态调试工具
- `pages/index/index.wxml` - 添加调试按钮
- `pages/index/index.wxss` - 添加调试按钮样式
- `pages/albums/albums.js` - 添加 TabBar 状态更新
- `pages/contact/contact.js` - 添加 TabBar 状态更新
- `pages/admin/dashboard/dashboard.js` - 添加 TabBar 状态更新

---

## 部署清单

### ✅ 必做事项

1. **配置 openId 白名单**
   ```bash
   # 已自动创建，确认包含正确的 openId
   cloudfunctions/getUserRole/admin.config.js
   cloudfunctions/wxLogin/admin.config.js
   ```

2. **上传云函数**（重要！）
   - 右键 `getUserRole` → "上传并部署：云端安装依赖"
   - 右键 `wxLogin` → "上传并部署：云端安装依赖"
   - 等待上传完成

3. **测试验证**
   - 管理员真机调试能看到底部"管理"标签
   - 普通用户看不到"管理"标签
   - 点击调试按钮查看状态正确

### ⚠️ 注意事项

1. **不要提交敏感配置**
   - 确认 `admin.config.js` 在 `.gitignore` 中
   - 提交前检查文件列表

2. **云函数配置同步**
   - 修改任何一个 `admin.config.js` 后
   - 记得同步到另一个云函数
   - 重新上传两个云函数

3. **调试按钮**
   - 仅在开发环境显示
   - 体验版和正式版自动隐藏

---

## 技术栈

- **小程序框架**: 微信小程序原生
- **云开发**: 腾讯云云开发
- **认证方案**: openId 白名单
- **UI 方案**: 自定义 TabBar

---

## 致谢

感谢所有贡献者的支持！🎉
