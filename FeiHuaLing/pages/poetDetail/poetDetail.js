// pages/poetDetail/poetDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    partialUrl: '',
    poetContent: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    // 接收传递的部分链接，这里假设是诗词的部分URL
    const partialUrl = options.url;
    // 输出 partialUrl，可以在控制台查看其值
    // console.log('Partial URL:', partialUrl);
    
    // 更新页面数据
    this.setData({ partialUrl: partialUrl });
    let util = require('../../utils/util.js');
    try {
      var html = await util.req('', '', partialUrl);
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
    const chineseOnly = html.replace(/[^\u4e00-\u9fa5\s，。！？；：“”《》]/g, '');
    const paragraphs = chineseOnly.split(/\n\s*\n\s*\n+/).slice(7, -5);
    const sentenceToRemove = "本节内容由匿名网友上传，原作者已无法考证。以上内容仅供学习参考，其观点不代表本站立场。";
    const cleanedParagraphs = paragraphs.map(paragraph => 
      paragraph.replace(sentenceToRemove, "")
    );
    console.log(cleanedParagraphs);
    var poetContent = cleanedParagraphs.join(" ");
    poetContent = poetContent.replace(/\t/g, "\n");
    poetContent = poetContent.replace(/\n+/g, "\n");
    this.setData({ poetContent: poetContent });
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