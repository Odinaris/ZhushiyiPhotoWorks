// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 检查管理员权限
async function checkAdmin(openid) {
  const userRes = await db.collection('users').where({
    _openid: openid
  }).get()
  
  return userRes.data.length > 0 && userRes.data[0].role === 'admin'
}

// 更新分类的作品数量
async function updateCategoryCount(categoryId) {
  const countRes = await db.collection('albums').where({
    categoryId: categoryId,
    isActive: true
  }).count()
  
  await db.collection('categories').doc(categoryId).update({
    data: {
      albumCount: countRes.total
    }
  })
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action, data, id } = event

  try {
    // 权限检查
    const isAdmin = await checkAdmin(openid)
    if (!isAdmin) {
      return {
        success: false,
        message: '无权限操作'
      }
    }

    let result = null

    switch (action) {
      case 'list':
        // 查询列表
        result = await db.collection('categories')
          .orderBy('order', 'asc')
          .get()
        
        // 更新每个分类的作品数量
        for (let category of result.data) {
          await updateCategoryCount(category._id)
        }
        
        // 重新查询获取更新后的数据
        result = await db.collection('categories')
          .orderBy('order', 'asc')
          .get()
        
        return {
          success: true,
          data: result.data || []
        }

      case 'add':
        // 添加
        result = await db.collection('categories').add({
          data: {
            ...data,
            albumCount: 0,
            createTime: new Date(),
            updateTime: new Date()
          }
        })
        return {
          success: true,
          data: { _id: result._id }
        }

      case 'update':
        // 更新
        const updateData = { ...data }
        delete updateData._id
        delete updateData.albumCount
        updateData.updateTime = new Date()
        
        result = await db.collection('categories')
          .doc(data._id)
          .update({
            data: updateData
          })
        return {
          success: true
        }

      case 'delete':
        // 检查是否有作品使用该分类
        const albumRes = await db.collection('albums').where({
          categoryId: id
        }).count()
        
        if (albumRes.total > 0) {
          return {
            success: false,
            message: '该分类下还有作品，无法删除'
          }
        }
        
        // 删除
        result = await db.collection('categories')
          .doc(id)
          .remove()
        return {
          success: true
        }

      default:
        return {
          success: false,
          message: '未知操作'
        }
    }
  } catch (err) {
    console.error('操作失败:', err)
    return {
      success: false,
      message: err.message
    }
  }
}
