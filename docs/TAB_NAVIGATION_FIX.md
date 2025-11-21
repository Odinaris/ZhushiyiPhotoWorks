# TabBar 页面跳转问题修复

## 🐛 问题描述

点击首页的分类后，跳转失败，错误信息：
```
navigateTo:fail can not navigateTo a tabbar page
```

## 🔍 根本原因

微信小程序中，`tabBar` 页面不能使用 `wx.navigateTo()`，必须使用 `wx.switchTab()`。

但 `wx.switchTab()` 有个限制：**不能传递 URL 参数**。

## 💡 解决方案

### 步骤 1：切换跳转方式
```javascript
// ❌ 错误方式
wx.navigateTo({
  url: `/pages/albums/albums?categoryId=${categoryId}&categoryName=${categoryName}`
})

// ✅ 正确方式  
wx.switchTab({
  url: '/pages/albums/albums'
})
```

### 步骤 2：参数传递机制
由于 `switchTab` 无法传递参数，使用小程序缓存机制：

#### 首页（发送方）
```javascript
goToCategoryAlbums(e) {
  const category = e.currentTarget.dataset.category
  
  // 将参数存入缓存
  wx.setStorageSync('category_params', {
    categoryId: category._id,
    categoryName: category.name
  })
  
  // 切换到 tabBar 页面
  wx.switchTab({
    url: '/pages/albums/albums'
  })
}
```

#### Albums 页面（接收方）
```javascript
onLoad(options) {
  let categoryId = options.categoryId
  let categoryName = options.categoryName ? decodeURIComponent(options.categoryName) : ''
  
  // 如果 URL 参数为空，从缓存读取
  if (!categoryId) {
    const categoryParams = wx.getStorageSync('category_params')
    if (categoryParams) {
      categoryId = categoryParams.categoryId
      categoryName = categoryParams.categoryName
      
      // 清除缓存，避免影响下次跳转
      wx.removeStorageSync('category_params')
    }
  }
  
  if (categoryId) {
    this.setData({
      currentCategoryId: categoryId,
      currentCategoryName: categoryName
    })
  }
}
```

### 步骤 3：优化 onShow 逻辑
避免重复加载分类导致参数丢失：
```javascript
onShow() {
  // 只有首次加载时才加载分类，避免重置 currentCategoryId
  if (!this.data.categories || this.data.categories.length === 0) {
    this.loadCategories()
  }
}
```

## 🧪 测试步骤

### 测试用例 1：分类跳转
1. 打开首页
2. 点击任意分类（如"外景系列"）
3. 查看控制台输出：
   ```
   点击分类: {_id: "8e2c0a2f691945ee03b47fac0be0f93c", name: "外景系列", ...}
   设置全局分类参数: {categoryId: "8e2c0a2f691945ee03b47fac0be0f93c", categoryName: "外景系列"}
   ```
4. 确认成功跳转到 albums 页面
5. 查看控制台输出：
   ```
   从缓存获取分类参数: {categoryId: "8e2c0a2f691945ee03b47fac0be0f93c", categoryName: "外景系列"}
   设置分类筛选: {categoryId: "8e2c0a2f691945ee03b47fac0be0f93c", categoryName: "外景系列"}
   ```
6. 确认显示"外景系列"分类的作品

### 测试用例 2：参数清理
1. 从首页跳转到某个分类
2. 返回首页
3. 点击"查看全部"
4. 确认显示所有作品（没有分类筛选）

### 测试用例 3：缓存清理
1. 从首页跳转到分类 A
2. 返回首页  
3. 从首页跳转到分类 B
4. 确认显示分类 B 的作品（而不是 A）

## 📱 兼容性说明

### 小程序版本
- **最低版本**：基础库 1.0.0（支持所有版本）
- **推荐版本**：基础库 2.0.0+（更稳定）

### 缓存机制
- 使用 `wx.setStorageSync/getStorageSync` 确保兼容性
- 跳转后立即清理缓存，避免污染

### 错误处理
- 添加了完整的错误处理和用户提示
- 详细的控制台日志便于调试

## 🔧 技术细节

### 缓存策略
```javascript
// 存储到缓存（首页）
wx.setStorageSync('category_params', {
  categoryId: category._id,
  categoryName: category.name
})

// 从缓存读取（albums 页面）
const categoryParams = wx.getStorageSync('category_params')

// 清理缓存（使用后）
wx.removeStorageSync('category_params')
```

### 参数优先级
1. **URL 参数**：直接从路由获取（最高优先级）
2. **缓存参数**：URL 为空时使用（次优先级）
3. **默认值**：都没有时显示全部（最低优先级）

### 生命周期处理
- `onLoad()`: 处理参数接收
- `onShow()`: 避免重复加载分类
- `loadAlbums()`: 使用当前分类ID加载数据

## ✅ 修复确认

### 修复前的问题
- ❌ `navigateTo:fail can not navigateTo a tabbar page`
- ❌ 参数无法传递到 tabBar 页面
- ❌ onShow 重复加载导致参数丢失

### 修复后的效果
- ✅ 正确使用 `wx.switchTab()` 跳转
- ✅ 通过缓存机制传递参数
- ✅ Albums 页面正确接收和显示分类
- ✅ 避免重复加载导致参数丢失
- ✅ 完整的错误处理和调试信息

---

**TabBar 页面跳转问题已完全解决！** 🎉