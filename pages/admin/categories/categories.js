const app = getApp()
const util = require('../../../utils/util.js')

Page({
  data: {
    categories: [],
    showModal: false,
    modalTitle: '',
    formData: {
      _id: '',
      name: '',
      order: 0,
      isActive: true
    },
    isEdit: false
  },

  onLoad() {
    this.checkPermission()
    this.loadCategories()
  },

  checkPermission() {
    if (!app.globalData.isAdmin) {
      util.showError('无权限访问')
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async loadCategories() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'adminCategories',
        data: { action: 'list' }
      })

      if (res.result && res.result.success) {
        this.setData({ categories: res.result.data || [] })
      }
    } catch (err) {
      console.error('加载分类失败:', err)
      util.showError('加载失败')
    }
  },

  addCategory() {
    this.setData({
      showModal: true,
      modalTitle: '添加分类',
      isEdit: false,
      formData: {
        _id: '',
        name: '',
        order: this.data.categories.length + 1,
        isActive: true
      }
    })
  },

  editCategory(e) {
    const item = e.currentTarget.dataset.item
    this.setData({
      showModal: true,
      modalTitle: '编辑分类',
      isEdit: true,
      formData: { ...item }
    })
  },

  async deleteCategory(e) {
    const id = e.currentTarget.dataset.id
    const confirm = await util.showConfirm('确定删除该分类吗?')
    
    if (confirm) {
      try {
        util.showLoading('删除中...')
        const res = await wx.cloud.callFunction({
          name: 'adminCategories',
          data: { action: 'delete', id }
        })

        if (res.result && res.result.success) {
          util.showSuccess('删除成功')
          this.loadCategories()
        } else {
          throw new Error(res.result?.message || '删除失败')
        }
      } catch (err) {
        console.error('删除失败:', err)
        util.showError('删除失败')
      } finally {
        util.hideLoading()
      }
    }
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: field === 'order' ? Number(value) : value
    })
  },

  onSwitchChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  async saveCategory() {
    const { name } = this.data.formData
    
    if (!name.trim()) {
      util.showError('请输入分类名称')
      return
    }

    try {
      util.showLoading('保存中...')
      
      // 准备提交的数据,移除空的_id
      const submitData = { ...this.data.formData }
      if (!this.data.isEdit || !submitData._id) {
        delete submitData._id
      }
      
      const res = await wx.cloud.callFunction({
        name: 'adminCategories',
        data: {
          action: this.data.isEdit ? 'update' : 'add',
          data: submitData
        }
      })

      if (res.result && res.result.success) {
        util.showSuccess('保存成功')
        this.closeModal()
        this.loadCategories()
      } else {
        throw new Error(res.result?.message || '保存失败')
      }
    } catch (err) {
      console.error('保存失败:', err)
      util.showError('保存失败')
    } finally {
      util.hideLoading()
    }
  },

  closeModal() {
    this.setData({ showModal: false })
  },

  stopPropagation() {}
})
