// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const catRes = await db.collection('categories')
      .where({ isActive: true })
      .orderBy('order', 'asc')
      .get()

    const categories = catRes.data || []

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

    const $ = db.command.aggregate
    const aggRes = await db.collection('albums').aggregate()
      .match({ isActive: true })
      .group({
        _id: '$categoryId',
        count: $.sum(1)
      })
      .end()

    const countsMap = {}
    ;(aggRes.list || []).forEach(item => {
      countsMap[item._id] = item.count || 0
    })

    categories.forEach(cat => {
      cat.albumCount = countsMap[cat._id] || 0
      cat.coverImage = coverMap[cat._id] || cat.coverImage || '/images/tab-album.png'
    })

    return {
      success: true,
      data: categories
    }
  } catch (err) {
    console.error('获取分类失败:', err)
    return {
      success: false,
      message: err.message
    }
  }
}
