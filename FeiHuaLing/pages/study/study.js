//Page/study.js
Page({
  data: {
    categories: [
      { id: 1, name: '推荐' },
      { id: 2, name: '分类' },
      { id: 3, name: '收藏' }
    ],
    swiperOptions: {
      indicatorDots: true,
      autoplay: true,
      interval: 3000,
      duration: 500
    } ,
    currentCategoryIndex: 0,
    currentCategory: { id: 1, name: '推荐' },
    isCategoryPage: false, // 是否处于“分类”界面，默认为false
    searchKeyword: '', // 新增变量存储搜索关键字
    collections: [] , // 收藏内容列表
  },

  onCategoryTap: function (e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentCategoryIndex: index,
      currentCategory: this.data.categories[index],
      isCategoryPage: index === 1 // 当点击的是“分类”界面时，将isCategoryPage设置为true
    });
  },

  onSearchInput: function (e) {
    this.setData({
      searchKeyword: e.detail.value.trim()
    });
  },

  onSearchSubmit: function () {
    // 跳转到搜索结果页面，同时传递搜索关键字
    wx.navigateTo({
      url: '/pages/searchResult/searchResult?keyword=' + this.data.searchKeyword
    });
  },

  onPoetIntroduction: function () {
    // 处理诗人介绍按钮点击事件
    wx.navigateTo({
      url: '/pages/poetIntroduction/poetIntroduction'
    });
  },

  onDevelopmentofPoetry: function () {
    // 处理诗词发展按钮点击事件
    wx.navigateTo({
      url: '/pages/DevelopmentofPoetry/DevelopmentofPoetry'
    });
  },

  onShow() {
    // 加载页面时从缓存中获取收藏内容
    const collections = wx.getStorageSync('collection') || [];
    this.setData({ collections: collections ,
      //isshoucang: index === 1 // 当点击的是“收藏”界面时，将isshoucang设置为true
    });
  },

  delete(e) {       //删除收藏记录
    const index = e.currentTarget.dataset.index
    var collections = this.data.collections
    wx.showActionSheet({
      itemList: ['删除'],
      success: (res) =>{
        collections.splice(index, 1)
        this.setData({
          collections: collections
        })
        wx.setStorageSync('collection', this.data.collections)
      }
    })
  },

  navigateToDetail(event) {
    //const history_i = event.currentTarget.dataset.history; // 外层循环的index
    //const message_i = event.currentTarget.dataset.message; // 内层循环的index

    // 获取诗词的URL或其他信息，这里假设是诗词的URL
    const poetryUrl = event.currentTarget.dataset.poetry;
    
    // 跳转到诗词详情页，传递诗词的URL作为参数
    wx.navigateTo({
      url: '/pages/poetryDetail/poetryDetail?url=' +poetryUrl,
    });
  } 
});
