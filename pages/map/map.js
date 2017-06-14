let amapFile = require('../../libs/amap-wx.js');
let conf = require('../../configs/config.js');
Page({
  data: {
    map: {
      lat: 0,
      lng: 0,
      count: 0,
      scale: 16,
      markers: [],
    },
    // polyline: [{
    //   points: [{
    //     longitude: 113.3245211,
    //     latitude: 23.10229
    //   }, {
    //     longitude: 113.324520,
    //     latitude: 23.21229
    //   }],
    //   color:"#FF0000DD",
    //   width: 2,
    //   dottedLine: true
    // }],
    controls: [{
      id: 1,
      iconPath: '/image/location-control.png',
      position: {
        left: 0,
        top:10,
        width: 40,
        height: 40
      },
      clickable: true
    }, {
      id: 2,
      iconPath: '/image/minus.png',
      position: {
        left: 0,
        top: 50,
        width: 40,
        height: 40
      },
      clickable: true
      }, {
        id: 3,
        iconPath: '/image/plus.png',
        position: {
          left: 40,
          top: 50,
          width: 40,
          height: 40
        },
        clickable: true
      }]
  },
  onReady: function (e) {
    // 使用 wx.createMapContext 获取 map 上下文 
    this.mapCtx = wx.createMapContext('myMap')
    this.mapCtx.scale = 10;
  },
  onLoad: function () {
    console.log('地图定位！')
    let that = this
    wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success:(res)=>{
            console.log(res)
            let latitude = res.latitude; 
            let longitude = res.longitude; 
            let marker=this.createMarker(res);
            this.setData({
                'map.lng':longitude,
                'map.lat':latitude,
            });
            this.getPOIData();
        }
    });
  },
  getPOIData() {
    let myAmapFun = new amapFile.AMapWX({ key: conf.Config.amap_key });
    let that = this;
    
    myAmapFun.getPoiAround({
      success: function (data) {
          if (data.markers.length <= 0) {
            return;
          }
          let markers = new Array();
          for (let item of data.poisData) {
            let loc = item.location.split(',');
            item.latitude = loc[1];
            item.longitude = loc[0];
            console.log(item);
            let marker = that.createMarker(item);
            markers.push(marker);
          }
          console.log(markers);
          that.setData({count: data.markers.length, 'map.markers':markers});
      },
      fail: function (info) {
        //失败回调
        console.log(info)
      },
      querykeywords: '门诊|卫生站|诊所',
      location: this.data.map.lng + ',' + this.data.map.lat
    })
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e)
  },
  controltap(e) {
    console.log(e.controlId)
    var that = this;
    console.log("scale===" + this.data.map.scale)
    if (e.controlId === 1) {
      that.moveToLocation();
    } else if (e.controlId === 2) {
      that.setData({ 'map.scale': --this.data.map.scale});
    } else if (e.controlId === 3) {
      that.setData({ 'map.scale': ++this.data.map.scale});
    }
  },
  getSchoolMarkers(){
    let markers=[];
    for(let item of schoolData){
      let marker=this.createMarker(item);
      markers.push(marker)
    }
    return markers;
  },
  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },
  createMarker(point){
    let latitude = point.latitude; 
    let longitude = point.longitude; 
    let marker= {
      iconPath: "/image/location.png",
      id:point.id || 0,
      name:point.name || '',
      label: {content: point.name} || {},
      callout: { content: point.name, bgColor: '#fff', display: 'ALWAYS'} || {},
      latitude: latitude,
      longitude: longitude,
      width: 20,
      height: 30
    };
    return marker;
  }
})