# 首页问题修复

## 🐛 修复的问题

### 1. 分类点击跳转失败

#### 问题描述
点击首页的分类后，跳转失败，错误信息：`navigateTo:fail can not navigateTo a tabbar page`

#### 根本原因
`albums` 页面是一个 tabBar 页面，不能使用 `wx.navigateTo()`，必须使用 `wx.switchTab()`。

#### 修复方案

**步骤1：切换到 switchTab**
```javascript
// 修复前
wx.navigateTo({
  url: `/pages/albums/albums?categoryId=${category._id}&categoryName=${encodeURIComponent(category.name)}`
})

// 修复后
wx.switchTab({
  url: '/pages/albums/albums'
})
```

**步骤2：参数传递机制**
由于 `switchTab` 无法传递 URL 参数，使用缓存机制：
```javascript
// 首页 - 存储参数到缓存
wx.setStorageSync('category_params', {
  categoryId: category._id,
  categoryName: category.name
})

// albums 页面 - 从缓存读取参数
const categoryParams = wx.getStorageSync('category_params')
if (categoryParams) {
  categoryId = categoryParams.categoryId
  categoryName = categoryParams.categoryName
  wx.removeStorageSync('category_params') // 清除缓存
}
```

**步骤3：优化 albums 页面的 onShow**
避免重复加载分类导致参数丢失：
```javascript
onShow() {
  // 只有在首次加载时才加载分类
  if (!this.data.categories || this.data.categories.length === 0) {
    this.loadCategories()
  }
}
```

#### 添加调试信息
- 首页：输出分类参数和跳转方式
- albums 页面：输出参数获取来源
- 使用后记得移除调试信息

### 2. 轮播图未延伸到标题栏

#### 问题描述
轮播图没有延伸到小程序的标题栏区域，没有达到预期的视觉效果。

#### 根本原因
- 页面使用默认导航栏样式
- 轮播图没有设置负边距来覆盖导航栏区域

#### 修复方案

1. **设置页面为自定义导航栏**
```json
// pages/index/index.json
{
  "navigationStyle": "custom"
}
```

2. **调整轮播图样式**
```css
/* 轮播图区域 */
.banner-section {
  height: 500rpx;
  margin-top: -100rpx; /* 向上延伸到状态栏和导航栏区域 */
}

.index-container {
  padding-top: 100rpx; /* 为自定义导航栏留出空间 */
}
```

## 🔧 具体修改的文件

### pages/index/index.js
- 添加分类点击的调试信息
- 添加错误处理
- 添加数据加载完成的日志

### pages/index/index.json
- 添加 `"navigationStyle": "custom"`

### pages/index/index.wxss
- 调整轮播图区域样式，实现延伸效果
- 调整容器间距，适应自定义导航栏

### pages/albums/albums.js
- 修复 onShow() 中的分类重置问题
- 添加参数接收和调试日志
- 添加云函数调用参数日志

## 🧪 测试验证

### 测试步骤 1：分类跳转
1. 打开首页
2. 查看控制台，确认分类数据加载正常
3. 点击任意分类
4. 查看控制台输出的跳转信息
5. 确认跳转到 albums 页面
6. 确认 albums 页面正确显示对应分类的作品

### 测试步骤 2：轮播图延伸
1. 打开首页
2. 查看轮播图是否延伸到状态栏区域
3. 下拉页面，确认内容不被导航栏遮挡
4. 测试不同机型的显示效果

## 📱 兼容性说明

### 自定义导航栏注意事项
- 需要为不同机型预留合适的状态栏高度
- iPhone X 系列需要考虑底部安全区域
- Android 机型状态栏高度差异较大

### 调试信息使用
- 调试完成后可以移除 console.log 输出
- 生产环境建议关闭详细日志

## ✅ 修复确认

### 修复前
- ❌ 分类点击无反应
- ❌ 轮播图未延伸到标题栏

### 修复后
- ✅ 分类点击正常跳转
- ✅ 轮播图正确延伸到标题栏
- ✅ albums 页面正确接收分类参数
- ✅ 详细的调试信息便于问题排查

---

**两个问题已完全修复！** 🎉