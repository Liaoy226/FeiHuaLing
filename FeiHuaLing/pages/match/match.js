// pages/match/match.js
let util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    prompt: '',
    contest: null,
    openid: null,
    clock: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.cloud.init({      
      env: 'cloud1-2gpac81i40983a59',
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
  async onHide() {
    let db = wx.cloud.database()
    let contests = db.collection('contest')
    let that = this
    if (!that.data.clock && that.data.contest) {
      await util.database_func("remove", contests, {
        _id: that.data.contest
      })
      
    }
    that.setData({
      prompt: '',
      contest: null,
      clock: false
    })
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

  },

  async match(e) {
    let db = wx.cloud.database()
    let _ = db.command
    let contests = db.collection('contest')
    let users = db.collection('user')
    let that = this
    if (that.data.clock) return
    if (that.data.contest) {
      await util.database_func("remove", contests, {
        _id: that.data.contest
      })
      that.setData({
        prompt: '',
        contest: ''
      })
    }
    else {
      that.setData({
        prompt: '匹配中...'
      })
      this.countdown()
      if (!that.data.openid) {
        that.setData({
          openid: await util.get_openid()
        })
        let res = await util.database_func("get", users, {
          openid: that.data.openid
        })
        if (res.length == 0) {
          wx.cloud.uploadFile({
            cloudPath: 'avatar/' + that.data.openid + '_avatar.jpeg', // 上传至云端的路径
            filePath: wx.getStorageSync('avatarUrl'), // 小程序临时文件路径
            success: async res => {
              await util.database_func("add", users, '', {
                name: wx.getStorageSync('nickName'),
                avatarUrl: res.fileID,
                openid: that.data.openid
              })
            }
          })
        }
        else {
          wx.cloud.uploadFile({
            cloudPath: 'avatar/' + that.data.openid + '_avatar.jpeg', // 上传至云端的路径
            filePath: wx.getStorageSync('avatarUrl'), // 小程序临时文件路径
            success: async res => {
              await util.database_func("update", users, {
                openid: that.data.openid
              }, {
                name: wx.getStorageSync('nickName'),
                avatarUrl: res.fileID
              })
            }
          })
        }
      }
      let res = await util.database_func("get", contests, {
        matched: false
      })
      var flag = false
      for (var contest of res) {
        let res1 = await util.database_func("update", contests, {
          _id: contest._id,
          matched: false
        }, {
          user: _.push(that.data.openid),
          matched: true
        })
        if (res1 == 1) {
          flag = true
          that.setData({
            contest: contest._id
          })
        }
        if (flag) break
      }
      if (!flag) {
        let res = await util.database_func("add", contests, '', {
          matched: false,
          user: [that.data.openid]
        })
        that.setData({
          contest: res
        })
        res = await util.database_func("watch", contests, {
          _id: that.data.contest,
          matched: true
        })
        if (res.length > 0) {
          that.setData({
            prompt: '匹配成功！',
            clock: true
          })
          let other = await that.get_other_avatar(true)
          setTimeout(()=>{wx.navigateTo({
            url: '../game/game?bot=&contest=' + that.data.contest + '&first=1&other_avatar=' + other[0] + '&other_name=' + other[1] })
          }, 1000)
        }
      }
      else {
        that.setData({
          prompt: '匹配成功！',
          clock: true
        })
        let other = await that.get_other_avatar(false)
        setTimeout(()=>{
          wx.navigateTo({
            url: '../game/game?bot=&contest=' + that.data.contest + '&first=&other_avatar=' + other[0] + '&other_name=' + other[1] })
        }, 1000)
      }
    }
  },

  async computer(e) {
    let db = wx.cloud.database()
    let _ = db.command
    let contests = db.collection('contest')
    if (this.data.contest) {
      await util.database_func('remove', contests, {
        contest: this.data._id
      })
    }
    wx.navigateTo({
      url: '../game/game?bot=true'
    })
  },
  
  async get_other_avatar(first) {
    return new Promise(async (resolve, reject) => {
      let db = wx.cloud.database()
      let users = db.collection('user')
      let contests = db.collection('contest')
      let openid = await util.database_func("get", contests, {
        _id: this.data.contest
      })
      if (first) openid = openid[0].user[1]
      else openid = openid[0].user[0]
      let res = await util.database_func("get", users, {
        openid: openid
      })
      wx.cloud.downloadFile({
        fileID: res[0].avatarUrl,
        success: file => {
          resolve([file.tempFilePath, res[0].name])
        }
      })
    })
  },

  countdown(){    //动态匹配中
    if (this.data.prompt.indexOf('匹配中') >= 0) {
      if (this.data.prompt == '匹配中...') {
        this.setData({
          prompt: '匹配中.'
        })
      }
      else {
        this.setData({
          prompt: this.data.prompt + '.'
        })
      }
      setTimeout(this.countdown, 500);
    }
  }
})