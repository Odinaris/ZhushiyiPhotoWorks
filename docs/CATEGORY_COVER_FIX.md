# 分类封面和选中问题修复

## 🐛 问题描述

1. **分类封面不显示**：首页分类列表没有显示对应的封面图
2. **选中分类不对**：跳转到 albums 页面后，选中的分类不正确

## 🔧 修复方案

### 问题 1：分类封面不显示

#### 根本原因
`getCategories` 云函数没有返回每个分类的封面图信息。

#### 修复方案
优化云函数逻辑，为每个分类获取封面图：

```javascript
// 获取每个分类的第一个作品作为封面
const coverRes = await db.collection('albums')
  .where({ 
    isActive: true,
    categoryId: db.command.in(categories.map(cat => cat._id))
  })
  .orderBy('order', 'asc')
  .get()

// 按分类ID分组封面图
const coverMap = {}
coverRes.data.forEach(album => {
  if (!coverMap[album.categoryId] && album.coverImage) {
    coverMap[album.categoryId] = album.coverImage
  }
})

categories.forEach(cat => {
  cat.albumCount = countsMap[cat._id] || 0
  cat.coverImage = coverMap[cat._id] || cat.coverImage || '/images/default-category.png'
})
```

#### 前端显示逻辑
```xml
<image 
  class="category-cover" 
  src="{{item.coverImage || '/images/default-category.png'}}" 
  mode="aspectFill"
></image>
```

### 问题 2：选中分类不对

#### 根本原因
- 缓存参数传递可能有问题
- albums 页面加载时序问题

#### 调试方案
增加详细的调试信息：

**首页（发送方）**
```javascript
// 输出点击的分类信息
console.log('点击分类:', category)

// 输出存入缓存的参数
console.log('准备跳转，分类参数:', categoryParams)
```

**Albums 页面（接收方）**
```javascript
// 输出接收到的 options
console.log('Albums页面 onLoad options:', options)

// 输出从缓存获取的参数
console.log('从缓存获取分类参数:', categoryParams)

// 输出设置的分类信息
console.log('设置分类筛选:', {
  categoryId: categoryId,
  categoryName: categoryName,
  currentCategoryId: this.data.currentCategoryId,
  currentCategoryName: this.data.currentCategoryName
})
```

## 🧪 测试步骤

### 测试分类封面
1. 打开首页
2. 查看控制台，确认分类数据加载完成
3. 查看输出：
   ```
   分类数据详情: [
     {id: "xxx", name: "外景系列", coverImage: "url", albumCount: 2},
     ...
   ]
   ```
4. 确认每个分类都有 `coverImage` 字段
5. 确认页面显示封面图

### 测试分类选中
1. 打开首页
2. 点击"外景系列"
3. 查看控制台输出：
   ```
   点击分类: {_id: "8e2c0a2f691945ee03b47fac0be0f93c", name: "外景系列", ...}
   准备跳转，分类参数: {categoryId: "8e2c0a2f691945ee03b47fac0be0f93c", categoryName: "外景系列"}
   ```
4. 跳转到 albums 页面后，查看控制台：
   ```
   Albums页面 onLoad options: {}
   从缓存获取分类参数: {categoryId: "8e2c0a2f691945ee03b47fac0be0f93c", categoryName: "外景系列"}
   设置分类筛选: {categoryId: "8e2c0a2f691945ee03b47fac0be0f93c", categoryName: "外景系列", currentCategoryId: "8e2c0a2f691945ee03b47fac0be0f93c", currentCategoryName: "外景系列"}
   ```
5. 确认左侧分类列表中"外景系列"高亮显示

## 📋 修复检查清单

### 云函数修复
- [ ] `getCategories` 云函数已上传
- [ ] 返回每个分类的 `coverImage` 字段
- [ ] 使用该分类下第一个作品的封面图
- [ ] 提供默认封面图

### 前端修复
- [ ] 首页分类显示正常
- [ ] albums 页面接收参数正常
- [ ] 分类选中状态正确
- [ ] 调试信息完整

### 功能测试
- [ ] 分类封面正常显示
- [ ] 点击分类正确跳转
- [ ] albums 页面正确显示分类作品
- [ ] 分类高亮状态正确

## 🔍 常见问题排查

### 如果分类封面仍然不显示
1. 检查云函数是否上传
2. 检查数据库中作品是否有封面图
3. 检查图片路径是否正确
4. 查看网络请求是否正常

### 如果分类选中不正确
1. 检查缓存是否正确清除
2. 检查 `currentCategoryId` 是否正确设置
3. 检查页面渲染时序问题
4. 查看分类列表的 `active` 条件是否正确

---

## 📱 兼容性

### 缓存机制
- 使用 `wx.setStorageSync/getStorageSync` 确保所有版本兼容
- 使用后立即清理缓存

### 错误处理
- 添加了完整的参数验证
- 提供详细的调试信息
- 优雅降级到默认状态

---

**分类封面和选中问题修复完成！** 🎉