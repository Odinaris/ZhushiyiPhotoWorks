# 项目配置说明

## 环境配置

本项目使用环境配置文件来管理敏感信息，确保隐私安全。

### 配置步骤

1. **复制环境配置示例文件**
   ```bash
   cp env.config.example.js env.config.js
   ```

2. **编辑 `env.config.js`**
   ```javascript
   module.exports = {
     // 填入您的云开发环境ID
     cloudEnvId: 'your-cloud-env-id'
   }
   ```

3. **复制项目配置示例文件**
   ```bash
   cp project.config.example.json project.config.json
   ```

4. **编辑 `project.config.json`**
   - 将 `appid` 字段替换为您的小程序 AppID

### 获取配置信息

- **AppID**: 在微信公众平台 → 开发 → 开发管理 → 开发设置中查看
- **云开发环境ID**: 在微信开发者工具 → 云开发控制台 → 设置中查看

### 注意事项

⚠️ **重要：`env.config.js` 和 `project.config.json` 包含敏感信息，已加入 `.gitignore`，不会被上传到 Git**

✅ 只有示例文件（`*.example.*`）会被上传到仓库

## 云函数部署

在微信开发者工具中，右键每个云函数文件夹，选择"上传并部署：云端安装依赖"。

需要部署的云函数：
- getUserRole
- getHomeData
- getCategories
- getAlbumsByCategory
- getAlbumDetail
- updateAlbumStats
- getContactInfo
- getAdminStats
- adminBanners
- adminCategories
- adminAlbums
- adminProfile
- adminContact

## 数据库配置

在云开发控制台创建以下集合：
- users (用户)
- photographer (摄影师信息)
- banners (轮播图)
- categories (作品分类)
- albums (作品集)
- contact (联系方式)

## 管理员设置

在 `users` 集合中，将您的用户记录的 `role` 字段设置为 `admin`。
