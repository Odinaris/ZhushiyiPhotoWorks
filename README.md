# 摄影作品展示小程序

一个用于独立摄影师展示和管理摄影作品的微信小程序,采用微信云开发技术栈。

## 功能特性

### 前台功能
1. **首页**
   - 堆叠效果轮播图,自动切换
   - 摄影师品牌信息展示
   - 精选作品列表

2. **作品页**
   - 左侧风格标签选择
   - 右侧作品集列表展示
   - 作品集详情查看
   - 图片大图预览和横滑浏览
   - 分享到微信好友/朋友圈

3. **联系我**
   - 常见问答展示
   - 联系方式信息
   - 工作时间和地址

### 后台管理(仅管理员)
1. **轮播图管理** - 添加、编辑、删除轮播图
2. **分类管理** - 管理作品风格分类标签
3. **作品集管理** - 添加、编辑作品集和图片
4. **品牌信息管理** - 编辑摄影师品牌信息
5. **联系方式管理** - 管理Q&A和联系信息

## 技术栈

- **前端**: 微信小程序原生开发
- **后端**: 微信云开发
  - 云函数
  - 云数据库
  - 云存储

## 数据库设计

### 1. users - 用户表
```javascript
{
  _id: "auto",
  _openid: "string",
  role: "string",  // admin | user
  createTime: Date,
  updateTime: Date
}
```

### 2. photographer - 摄影师信息表
```javascript
{
  _id: "auto",
  brandName: "string",
  slogan: "string",
  introduction: "string",
  styles: ["string"],
  createTime: Date,
  updateTime: Date
}
```

### 3. banners - 轮播图表
```javascript
{
  _id: "auto",
  imageUrl: "string",
  order: Number,
  isActive: Boolean,
  createTime: Date,
  updateTime: Date
}
```

### 4. categories - 分类表
```javascript
{
  _id: "auto",
  name: "string",
  order: Number,
  isActive: Boolean,
  albumCount: Number,
  createTime: Date,
  updateTime: Date
}
```

### 5. albums - 作品集表
```javascript
{
  _id: "auto",
  title: "string",
  description: "string",
  coverImage: "string",
  categoryId: "string",
  categoryName: "string",
  images: [{
    url: "string",
    order: Number,
    description: "string"
  }],
  isFeatured: Boolean,
  viewCount: Number,
  shareCount: Number,
  order: Number,
  isActive: Boolean,
  createTime: Date,
  updateTime: Date
}
```

### 6. contact - 联系方式表
```javascript
{
  _id: "auto",
  qaList: [{
    question: "string",
    answer: "string",
    order: Number
  }],
  contacts: [{
    type: "string",
    label: "string",
    value: "string",
    icon: "string",
    order: Number
  }],
  workingHours: "string",
  location: "string",
  updateTime: Date
}
```

## 云函数列表

### 前台云函数
- `getUserRole` - 获取用户角色
- `getHomeData` - 获取首页数据
- `getCategories` - 获取分类列表
- `getAlbumsByCategory` - 按分类获取作品集
- `getAlbumDetail` - 获取作品集详情
- `updateAlbumStats` - 更新统计数据
- `getContactInfo` - 获取联系信息

### 后台云函数
- `getAdminStats` - 获取统计数据
- `adminBanners` - 轮播图CRUD
- `adminCategories` - 分类CRUD
- `adminAlbums` - 作品集CRUD
- `adminProfile` - 品牌信息管理
- `adminContact` - 联系方式管理

## 部署步骤

### 1. 创建云开发环境
1. 在微信开发者工具中打开项目
2. 点击"云开发"按钮,创建云开发环境
3. 记录环境ID

### 2. 配置环境ID
在 `app.js` 中修改云开发环境ID:
```javascript
globalData: {
  cloudEnvId: 'your-env-id' // 替换为您的环境ID
}
```

### 3. 创建数据库集合
在云开发控制台中创建以下集合:
- users
- photographer
- banners
- categories
- albums
- contact

### 4. 部署云函数
在微信开发者工具中:
1. 右键 `cloudfunctions` 目录下的每个云函数文件夹
2. 选择"上传并部署:云端安装依赖"
3. 等待部署完成

### 5. 设置管理员权限
1. 在云开发数据库的 `users` 集合中
2. 找到您的用户记录(通过openid)
3. 将 `role` 字段修改为 `admin`

### 6. 准备TabBar图标
将准备好的TabBar图标放入 `images` 目录:
- tab-home.png / tab-home-active.png
- tab-album.png / tab-album-active.png
- tab-contact.png / tab-contact-active.png

推荐尺寸: 81x81px

## 使用说明

### 管理员首次使用
1. 登录小程序后,在数据库中设置自己为管理员
2. 首页会出现"管理后台"入口
3. 进入管理后台,依次设置:
   - 品牌信息
   - 创建分类标签
   - 上传轮播图
   - 添加作品集
   - 设置联系方式

### 普通用户使用
1. 浏览首页精选作品
2. 在作品页按分类浏览
3. 点击作品集查看详情
4. 分享喜欢的作品
5. 查看联系方式

## 注意事项

1. **权限控制**: 只有 `role` 为 `admin` 的用户才能访问管理后台
2. **图片上传**: 建议压缩图片后上传,提升加载速度
3. **云存储**: 定期清理未使用的云存储文件
4. **数据备份**: 定期导出数据库数据进行备份

## 目录结构

```
photo-works/
├── cloudfunctions/        # 云函数
│   ├── getUserRole/
│   ├── getHomeData/
│   ├── adminBanners/
│   └── ...
├── pages/                 # 页面
│   ├── index/            # 首页
│   ├── albums/           # 作品页
│   ├── album-detail/     # 作品详情
│   ├── contact/          # 联系我
│   └── admin/            # 管理后台
├── utils/                # 工具函数
├── images/               # 图片资源
├── app.js                # 全局逻辑
├── app.json              # 全局配置
└── app.wxss              # 全局样式
```

## 扩展功能建议

1. **数据统计**: 添加访问统计和数据分析
2. **在线预约**: 添加拍摄预约功能
3. **评论功能**: 允许用户评论作品
4. **收藏功能**: 用户可收藏喜欢的作品
5. **搜索功能**: 添加作品搜索
6. **多语言支持**: 支持中英文切换

## 许可证

MIT License

## 作者

摄影工作室小程序
