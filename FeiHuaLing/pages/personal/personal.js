// pages/personal/personal.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '',
    nickName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      avatarUrl: wx.getStorageSync('avatarUrl'),
      nickName: wx.getStorageSync('nickName')
    });
  },
  
  // 对战记录
  recordClick() {
    wx.navigateTo({
      url: '../history/history'
    })
  },
  // 清空数据
  clearClick() {
    wx.showModal({
      title: '提示',
      content: '该操作将清空您所有的游戏记录和收藏列表，确定要清空吗？',
      success: function (res) {
        if (res.confirm) {
          wx.setStorageSync('best', 0)        // 最高分设为0
          wx.setStorageSync('history', [])    // 清空对战记录
          wx.setStorageSync('collection', []) // 收藏列表
          wx.showToast({
            title: '清空成功！',
            icon: 'success',
            duration: 1000
          });
        } else if (res.cancel) {
          // 取消
        }
      }
    });
  },
  
  // 使用说明
  aboutClick() {
    wx.navigateTo({
      url: '../about/about'
    })
  },

  // 在线客服
  handleContact() {
    console.log(e.detail.path),
    console.log(e.detail.query)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})