# 🔍 真机调试问题排查清单

## 问题：真机看不到"管理"标签

### ⚡ 快速排查（5分钟）

#### 1. 获取真机 openId（1分钟）

在真机预览时：
- 点击首页右下角 "📋 获取我的 openId" 按钮
- 复制弹窗中显示的 openId

**你的 openId：** `________________`

---

#### 2. 检查白名单（30秒）

打开 `cloudfunctions/admin.config.js`，确认包含真机 openId：

```javascript
module.exports = {
  ADMIN_OPENIDS: [
    'olg5x14n5AduM1nbbdUwypI7iies',  // ← 这是开发工具的 openId
    '你的真机openId'                   // ← 添加这行
  ]
}
```

**⚠️ 关键点：开发工具和真机的 openId 可能不同！**

---

#### 3. 重新上传云函数（1分钟）

在微信开发者工具中：

- [ ] 右键 `getUserRole` → 上传并部署
- [ ] 右键 `wxLogin` → 上传并部署
- [ ] 等待上传完成（绿色勾号）

---

#### 4. 重新真机预览（1分钟）

- [ ] 重新生成预览二维码
- [ ] 用手机扫码进入小程序
- [ ] 查看底部是否有"管理"标签

---

#### 5. 查看日志（1分钟）

在小程序中，查看控制台输出：

```
自动登录成功: {
  role: "admin",           ← 应该是 "admin"
  isAdmin: true,           ← 应该是 true
  openId: "oXXXX-..."      ← 记录这个 openId
}

TabBar 管理员状态更新: true  ← 应该是 true
```

---

## ✅ 预期结果

- [x] 控制台显示 `isAdmin: true`
- [x] 控制台显示 `TabBar 管理员状态更新: true`
- [x] 底部导航栏显示 4 个标签（首页、作品、联系我、**管理**）

---

## ❌ 如果仍然失败

### 方案 1：启用调试模式

在 `app.json` 中添加：

```json
{
  "debug": true,
  "pages": [...],
  ...
}
```

重新预览，查看 vConsole 中的详细日志。

---

### 方案 2：检查云函数日志

1. 打开[云开发控制台](https://console.cloud.tencent.com/tcb)
2. 点击"云函数" → `getUserRole`
3. 点击"日志"标签
4. 查看最近的调用记录

**预期看到：**
```
openId: oXXXX-your-openid
isAdmin: true
```

**如果看到 `isAdmin: false`**：
- → openId 不在白名单中
- → 检查 `admin.config.js` 是否配置正确
- → 确认云函数是否重新上传

---

### 方案 3：对比 openId

| 环境 | openId | 是否在白名单 |
|-----|--------|------------|
| 开发工具 | `olg5x14n5AduM1nbbdUwypI7iies` | ✅ 是 |
| 真机预览 | `________________` | ❓ 待确认 |

---

## 🎯 最常见的原因

### 原因 1：openId 不一致（90%）

**现象**：
- 开发工具能看到管理标签
- 真机看不到

**原因**：
- 同一个微信号在不同环境的 openId 不同

**解决**：
```javascript
// admin.config.js
module.exports = {
  ADMIN_OPENIDS: [
    'olg5x14n5AduM1nbbdUwypI7iies',  // 开发工具
    'oXXXX-真机的openId'              // 添加真机 openId
  ]
}
```

---

### 原因 2：云函数未更新（5%）

**现象**：
- 修改了 `admin.config.js`
- 真机仍然看不到

**原因**：
- 云函数没有重新上传

**解决**：
- 必须重新上传 `getUserRole` 和 `wxLogin`

---

### 原因 3：时序问题（3%）

**现象**：
- 日志显示 `isAdmin: true`
- 但 TabBar 不显示

**原因**：
- TabBar 初始化太早

**解决**：
- 已修复：每次页面 `onShow()` 都会刷新状态
- 如果仍然不行，尝试切换页面后再回来

---

### 原因 4：网络或缓存问题（2%）

**现象**：
- 云函数调用失败
- 日志没有"自动登录成功"

**原因**：
- 网络问题
- 小程序缓存

**解决**：
```bash
# 清除缓存
1. 微信开发者工具 → 清缓存 → 全部清除
2. 手机微信 → 我 → 设置 → 通用 → 存储空间 → 清理缓存
3. 重新预览
```

---

## 📱 调试技巧

### 技巧 1：使用真机调试

在开发者工具中：
1. 点击"真机调试"（不是"预览"）
2. 扫码后可以在电脑上看到手机的控制台日志
3. 更容易排查问题

---

### 技巧 2：添加临时日志

在 `app.js` 的 `autoLogin()` 中添加：

```javascript
console.log('===== 调试信息 =====')
console.log('云函数返回:', res)
console.log('userInfo:', res.result.data.userInfo)
console.log('openId:', res.result.data.userInfo?._openid)
console.log('isAdmin:', res.result.data.isAdmin)
console.log('==================')
```

---

### 技巧 3：强制刷新

在小程序首页，下拉刷新（如果启用了）可以重新触发 `autoLogin()`。

---

## 📞 需要帮助？

如果以上方法都无法解决，请提供：

1. **真机 openId**：`________________`
2. **开发工具 openId**：`olg5x14n5AduM1nbbdUwypI7iies`
3. **控制台日志**：复制 vConsole 中的完整日志
4. **云函数日志**：云开发控制台的日志截图
5. **配置文件**：`admin.config.js` 的内容（可脱敏）

---

## ✨ 时序问题已优化

**v2024.11.16 更新：**

1. ✅ 支持多个回调监听器
2. ✅ TabBar 每次显示时自动刷新状态
3. ✅ 超时时间延长至 5 秒
4. ✅ 页面 `onShow()` 时强制刷新 TabBar
5. ✅ `app.updateTabBar()` 主动通知 TabBar 更新

**理论上时序问题已完全解决！**

---

**祝调试顺利！** 🎉

如果问题解决了，记得在 `app.json` 中删除 `"debug": true`。
