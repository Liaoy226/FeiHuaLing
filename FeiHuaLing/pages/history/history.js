// pages/history/history.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    history: null,
    empty: "<empty>"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (!wx.getStorageSync('history')) {   //如果缓存里没有历史记录
      wx.setStorageSync('history', [])      //新建列表
    }
    this.setData({
      history: wx.getStorageSync('history')
    })
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
    var history = this.data.history
    for (var i of history) {    //将所有记录合上
      i.open = false
    }
    wx.setStorageSync('history', history)
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

  },

  open(e) {
    const index = e.currentTarget.dataset.h_i
    var history = this.data.history
    history[index].open = true
    this.setData({
      history: history
    })
  },

  close(e) {
    const index = e.currentTarget.dataset.h_i
    var history = this.data.history
    history[index].open = false
    this.setData({
      history: history
    })
  },

  delete(e) {       //删除对战记录
    const index = e.currentTarget.dataset.h_i
    var history = this.data.history
    wx.showActionSheet({
      itemList: ['删除'],
      success: (res) =>{
        history.splice(index, 1)
        this.setData({
          history: history
        })
        wx.setStorageSync('history', this.data.history)
      }
    })
  },

  async collect(e) {
    const history_i = e.currentTarget.dataset.history   //外层循环的index
    const message_i = e.currentTarget.dataset.message   //内层循环的index
    var history = this.data.history
    wx.showActionSheet({
      itemList: ['收藏'],
      success: async (res) =>{
        const sentence = history[history_i].answers[message_i].content
        var util = require('../../utils/util.js');
        try {
          var html = await util.req('ju', sentence);        //查询整句
        }
        catch(err) {
          wx.showToast({
            title: err.message,
            icon: 'error',
            duration: 2000
          });
          console.error('请求失败:', err);
          return
        }
        html = html.replace(/<font color=\'red\'>/g, '')  //去除强调关键字的格式
        html = html.replace(/<\/font>/g, '')
        if (!wx.getStorageSync('collection')) {   //如果缓存里没有收藏列表
          wx.setStorageSync('collection', [])      //新建列表
        }
        var collection = wx.getStorageSync('collection')
        var add = false
          while (true) {
            var ju = html.match('<a class="juzi" href="/mingju/.+.html">(.*)</a>')
            var url = html.match('<a class="jucc" href="(.*)">')
            //获取整句和诗词的页面对应的url
            if (!ju) {
              html = html.substr(html.lastIndexOf('selected>第'), html.length)
              var next = html.match('<option value=\'(.*)\'>第')
              if (!next) break
              next = next[1]
              try {
                html = await util.req('', '', next);
              }
              catch(err) {
                wx.showToast({
                  title: err.message,
                  icon: 'error',
                  duration: 2000
                });
                console.error('请求失败:', err);
                return
              }
              html = html.replace(/<font color=\'red\'>/g, '')
              html = html.replace(/<\/font>/g, '')
              ju = html.match('<a class="juzi" href="/mingju/.+.html">(.*)</a>')
              url = html.match('<a class="jucc" href="(.*)">')
            }
            ju = ju[1]
            url = url[1]
            console.log(ju)
            if (util.find_key(ju, sentence, false)) {   //查看是否是完整的短句，查询结果中可能包括只是短句的一部分的结果
              var flag = false
              for (var i of collection) {         //找有没有收藏过
                if (i.sentence == ju) {
                  flag = true
                  break
                }
              }
              if (!flag) {
                add = true
                collection = collection.concat({
                  sentence: ju,
                  poetry: url
                })
              }
            }
            else break    //完整的会排在前面，所以出现不是完整的就直接结束
            html = html.substring(html.lastIndexOf(url), html.length)
          }
          if (add) {
            wx.showToast({
              title: '收藏成功！',
              icon: 'success',
              duration: 1000
            });
            wx.setStorageSync('collection', collection)
          }
          else {
            wx.showToast({
              title: '已经收藏过！',
              icon: 'error',
              duration: 1000
            });
          }
        }
    })
  }
})