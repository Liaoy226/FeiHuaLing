// index.js
const defaultAvatarUrl = 'cloud://cloud1-2gpac81i40983a59.636c-cloud1-2gpac81i40983a59-1327119078/images/0.png'

Page({
  data: {
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    this.setData({
      "userInfo.nickName": nickName,
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  async onLoad() {
        wx.cloud.init({      
          env: 'cloud1-2gpac81i40983a59',
        })
        let util = require('../../utils/util.js');
        const openid = await util.get_openid()
        let db = wx.cloud.database()
        let user = db.collection("user")
        let res = await util.database_func("get", user, {
          openid: openid
        })
        if (res.length > 0) {
          console.log(res)
          this.setData({
            "userInfo.avatarUrl": wx.getStorageSync('avatarUrl'),
            "userInfo.nickName": wx.getStorageSync('nickName')
          })
        }
      },

  onLogin() {
    const { nickName, avatarUrl } = this.data.userInfo;
    if (nickName && avatarUrl && avatarUrl !== defaultAvatarUrl) {
      // 保存信息，wx.getStorageSync('nickName')获取
      wx.setStorageSync('avatarUrl', this.data.userInfo.avatarUrl);
      wx.setStorageSync('nickName', this.data.userInfo.nickName);
      // 页面跳转
      wx.switchTab({
        url: '../study/study'
      });
    } else {
      // 提示用户完善信息
      wx.showToast({
        title: '请完善信息',
        icon: 'error',
      });
    }
  },

  main() {
    
  }
})
