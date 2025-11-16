# 云函数配置说明

## 📋 快速开始

### 1. 配置管理员白名单

首次使用时，需要创建管理员配置文件：

```bash
# 复制示例文件
cp admin.config.example.js admin.config.js
```

### 2. 编辑配置文件

打开 `admin.config.js`，填入管理员的 openId：

```javascript
module.exports = {
  ADMIN_OPENIDS: [
    'oABCD-your-openid-here',  // 替换为真实 openId
    'oEFGH-another-openid'
  ]
}
```

### 3. 如何获取 openId？

1. 使用微信开发者工具打开小程序
2. 在首页点击"📋 获取我的 openId"按钮
3. 复制弹窗中显示的 openId

### 4. 上传云函数

在微信开发者工具中：

1. 右键 `getUserRole` → 上传并部署
2. 右键 `wxLogin` → 上传并部署

---

## 🔒 安全说明

- ✅ `admin.config.js` 已加入 `.gitignore`，不会被提交到 Git
- ✅ `admin.config.example.js` 是示例文件，会被提交到 Git
- ⚠️ **不要将真实 openId 写入示例文件！**

---

## 📁 文件说明

| 文件 | 说明 | 是否提交到Git |
|-----|------|-------------|
| `admin.config.js` | 真实配置文件，包含 openId | ❌ 不提交 |
| `admin.config.example.js` | 示例文件，仅供参考 | ✅ 提交 |
| `getUserRole/index.js` | 读取 admin.config.js | ✅ 提交 |
| `wxLogin/index.js` | 读取 admin.config.js | ✅ 提交 |

---

## 🤝 团队协作

### 方式 1：内部共享配置文件

通过私密渠道（如企业微信、钉钉）共享 `admin.config.js` 文件。

### 方式 2：文档记录

在团队文档中记录所有管理员 openId，团队成员根据文档手动创建配置文件。

### 方式 3：环境变量（高级）

使用云开发环境变量管理敏感配置（需要额外配置）。

---

## ❓ 常见问题

### Q1: 找不到 admin.config.js 文件？

**A:** 首次使用需要手动创建，可以复制 `admin.config.example.js` 为 `admin.config.js`。

### Q2: 云函数报错"未找到 admin.config.js"？

**A:** 这是正常警告，云函数会使用空白名单。请在本地创建配置文件后重新上传云函数。

### Q3: 如何验证配置是否生效？

**A:** 
1. 查看云函数日志
2. 在小程序控制台查看 `isAdmin` 状态
3. 检查底部导航栏是否显示"管理"标签

---

更多详细信息，请查看项目根目录的 `DEPLOY_STEPS.md` 和 `OPENID_AUTH_GUIDE.md`。
