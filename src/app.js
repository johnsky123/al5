$(function(){
    var control, currentPlanarGraphId, destMarker, fromMarker, loadPlanarGraph, locationProvider, mapStyle, markers, navi, navigationProvider,fromLatlng, routineLayer,selectedLatlng;
    var onOff=true;


    var map = new NGR.View('map', {
        appKey: "a07a6ecb88aa45b8a6d5d3b2fff03c86",


    });
    var datasource = new NGR.DataSource({
        appKey: "a07a6ecb88aa45b8a6d5d3b2fff03c86"
    });
    var naviProvider = NGR.navigationProvider({
        appKey: "a07a6ecb88aa45b8a6d5d3b2fff03c86"

    });

    var parkId=833;
    var locFloor=null;
    var toLatlng=null;

    var fromFloor=null;
    var toFloor=null;
    console.log(encodeURI(location.href));
    $.ajax({
        type: "get",
        url: "http://106.75.7.176:8080/carseeker/token/void?url="+encodeURI(location.href),
        dataType: "JSON",
        success: function(mmc) {
            tmpToken=JSON.parse(mmc);
            wx.config({
                debug: false,
                appId: 'wxe21893a8a56de849',
                timestamp: tmpToken.timestamp,
                nonceStr: tmpToken.nonceStr,
                signature: tmpToken.signature,
                jsApiList: ['startSearchBeacons','onMenuShareTimeline','checkJsApi','onSearchBeacons','hideOptionMenu']
            });
        },
        error: function(errmsg) {
            console.log(errmsg);
        }
    });


    window.layers = {};

    markers = {};

    currentPlanarGraphId = null;

    mapStyle = null;
    floorList=[];

    control = NGR.control.floor({
        position:'bottomleft'
    });

    control.on('change', function(e) {
        control.setCurrentFloor(e.to,function(){
            loadPlanarGraph(e.to);
        })
        currentFloor = control.getCurrentFloor();
        console.log( map.getZoom());

    });
    /*  map.addControl(control);*/
    var platePrefixsToggleFlag = false;
    var province = null;
    var letter = null;

    var bleLocation = new NGR.BeaconLocationEngine();
    bleLocation.fetchBeaconConfig({
        appKey: "a07a6ecb88aa45b8a6d5d3b2fff03c86",
        mapId: 833,
        server:"https://www.ipalmap.com/open/scene/ble/beacons"
    }).then(function (beaconConfig) {
        bleLocation.initBeaconConfig(beaconConfig);
    });
    map.removeControl(map._core_map.logoControl);

    $(".platePrefix").bind('touchstart',function () {
        var platePrefixs = ["京", "津", "沪", "渝", "冀", "豫", "云", "辽", "黑", "湘", "皖", "鲁", "新", "苏", "浙",
            "赣", "鄂", "桂", "甘", "晋", "蒙", "陕", "吉", "闽", "贵", "粤", "青", "藏", "川", "宁", "琼"];

        $(".platePrefixAppendPieces").remove();
        if (platePrefixsToggleFlag) {
            $("#platePrefixForAppend").css('display', 'none');
        } else {
            $("#platePrefixForAppend").css('display', 'block');

            platePrefixs.forEach(function (platePrefix) {
                $("#platePrefixForAppend").append('<div Class="province platePrefixAppendPieces"></div>');
                $(".province:last").html(platePrefix);
            });
            $(".province").click(function () {
                var asciiBase = "A".charCodeAt();

                province = $(this).html();

                $(".platePrefixAppendPieces").remove();

                for(var i=0;i<26;++i) {
                    $("#platePrefixForAppend").append('<div Class="letter platePrefixAppendPieces"></div>');
                    $(".letter:last").html(String.fromCharCode(asciiBase + i));
                }

                $(".letter").click(function () {
                    letter = $(this).html();
                    $(this).addClass('active');
                    $(".platePrefix").html(province + letter);
                    $("#platePrefixForAppend").css('display', 'none');
                });
            });
        }

        platePrefixsToggleFlag = !platePrefixsToggleFlag;
    });
    datasource.requestMaps(833).then(function(maps) {
        return datasource.requestPOIChildren(866187).then(function(res) {
            var testDefault=0;
            var defaultFloor=null;
            res.forEach(function(floor){
                /*floor.address = floor.address.slice(2);
                 floorAddressArray.push(floor.address);*/
                if(floor.default===true){
                    defaultFloor=testDefault;
                }
                testDefault=testDefault+1;
                floorList.push(floor.id);
                floorMap[floor.id]=floor.name;

            });
            currentFlooroo=res[defaultFloor?defaultFloor:0].id;

            control.setFloorList(res);
            control.setCurrentFloor(866187,loadPlanarGraph(866187));



        } );
    })


    fromMarker = null;

    destMarker = null;



    routineLayer = NGR.layerGroup();
    currentFloor = null;
    var floorMap = {};
    var mapsInfoPOIID = null;
    var inputHandler = function (e) {
        var elementId= e.target.id;
        var inputHVal= $(this).val();
        console.log($(this).val())
        if($('.searOneInput').has(inputHVal)){
            $('.OutDoorPoi').html('');
        }


        var elementId = e.target.id;
        var forAppendId = elementId;
        var POIKeywords = $(this).val();
        console.log(POIKeywords);
        var selectedFloor = null;
        var selectedPoiId = null;
        var pattSpace = /^\s*$/g;

        $(".appendPieces").remove();
        $(".forAppend").css("display", "none");


        if (pattSpace.test(POIKeywords)) {
            return ;
        }

        datasource.POISearch({"keywords": POIKeywords, "start": 1, "count": 7, "parents": floorList}).then(function (res) {
            console.log(res.list.length);

            if (res.list.length === 0) {
                return ;
            }
            res.list.forEach(function (poiInfo) {

                var wwa=$('<div class="OutDorPoiBox POI_search"><div class="PoiIcon"><img src="http://smartapp.alihive.com/static/src/images/images/ico_location%402x.png"></div><div class="OpBoxMes"><span class="PoiSearMes searchPOIMES"></span><a class="mmoA"></a><div class="GeoHide"></div><div class="floorHide"></div><div class="mmciocj"></div></div></div>')
                $('.OutDoorPoi').append(wwa);
                $('.searchPOIMES:last').html(poiInfo.name);
                $('.mmoA:last').html(poiInfo.address);
                $('.floorHide:last').html(poiInfo.parent);
                $('.mmciocj:last').html(poiInfo.id);

            });
            reLoad();
            function reLoad(){
                var loadMes= localStorage.getItem("a");
            }
            $('.POI_search').bind('touchstart',function(){
                var mmco=$(this).index();
                var jocki=document.getElementsByClassName('floorHide');
                var lnnidn=document.getElementsByClassName('mmciocj');
                var pociname=document.getElementsByClassName('searchPOIMES');
                var mmconame=pociname[mmco];
                localStorage.setItem("a",mmconame);
                var locaFloor = jocki[mmco].innerHTML;
                setFlorList=lnnidn[mmco].innerHTML;
                $(this).addClass('active').siblings().removeClass('active');
                var polygon=layers.area._featureLayers[setFlorList]._latlngs;
                if(locaFloor===currentFloor){


                    selectedLatlng = NGR.FeatureLayerUtils.getInnerPointByLayer(NGR.polygon(layers.area._featureLayers[setFlorList]._latlngs));
                    control.setCurrentFloor(locaFloor,loadPlanarGraph(locaFloor));

                    var destMarker = NGR.marker(selectedLatlng, {
                        draggable: true
                    });
                    destMarker.addTo(map);
                }else {
                    datasource.requestPlanarGraph(locaFloor).then(function(layerInfo) {
                        var tempFeatureLayers = NGR.featureLayer(layerInfo,{
                            layerType: 'Area'
                        });

                        selectedLatlng = NGR.FeatureLayerUtils.getInnerPointByLayer(NGR.polygon(tempFeatureLayers._featureLayers[setFlorList]._latlngs));
                        /* control.fire('change', {
                         from: control.getCurrentFloor(),
                         to: locaFloor
                         });*/
                        control.setCurrentFloor(locaFloor,loadPlanarGraph(locaFloor));

                        destMarker = NGR.marker(selectedLatlng,{
                            draggable: true
                        });
                        destMarker.addTo(map);



                    });


                }

                /* if (control.getCurrentFloor() !== locaFloor){


                 control.fire('change', {
                 from: control.getCurrentFloor(),
                 to: locaFloor
                 });


                 /!*  var destMarker = NGR.marker(selectedLatlng, {
                 draggable: true
                 });
                 destMarker.addTo(map);*!/

                 } else {

                 /!* var  destMarker = NGR.marker(selectedLatlng, {
                 draggable: true
                 });
                 destMarker.addTo(map);*!/


                 }*/






                /*  locachange();*/
                $('#map').css({display:'block'})
                $('#OutDoorMap').css({display:'block'});
                $('.searchPage').css({display:'none'});


            });
        });
    };

    var goHereOnoff=true;
    var  toFlooroo=null;
    var  fromFlooroo=null;


    $('.MessageTwo').bind('touchstart',function(){

        if(locFloor){
            fromLatlngoo=macLatLng;
            fromFlooroo=licationcontrol;
            toLatlngoo=toLatlng;
            toFlooroo=toFloormm;




            if(CarMarker){
                map.removeLayer(CarMarker);
            }
            if(fromFlooroo !== toFlooroo){
                startMarker = NGR.marker(fromLatlngoo,{
                    icon: startIcon
                });
                startMarker.addTo(map);
                navi()





            }
            else{
                startMarker = NGR.marker(fromLatlngoo,{
                    icon: startIcon
                });
                destMarker = NGR.marker(toLatlngoo, {
                    icon: destIcon
                });
                startMarker.addTo(map);
                destMarker.addTo(map);
                navi()
                console.log(latOne)

            }


        }else{
            $('.wrapMes').css({display:'none'})
            $('.wrapMesbox').css({display:'block'})

        }





    })
    /* if($('.endLocation').css({display:'block'})){
     console.log('this have end')
     }*/
    $('.endLocation').bind('touchstart',function(){
        if($('.endLocation').css({display:'block'})) {
            location.href="http://parking.ipalmap.com"
        }
    })

    fromMarker = null;

    destMarker = null;
    /*  $('.plateInput').input(function(){
     console.log($(this).val().length)
     })*/
    $('.plateInput').bind('keyup',function(){
        var mmcob=$(this).val().toUpperCase().substring(0,5)
        $(this).val(mmcob);

        if($(this).val().length >=5){
            $('.Btn_search').css({background:'#5b9f92',color:'#fff'});
            $('.plateInput').blur();


            $(this).val().substring(0,5);


        }else

        {

            $('.Btn_search').css({background:'#fff',color:'#999'})
        }

    })
    var searchHistroy=null;
    var getLocal=[];
    var getSearchHistroy=null;
    var searchHistroy=null;
    var limitLocal=[];
     searchHistroy = localStorage.getItem("history");
    console.log(searchHistroy)
      
       if(searchHistroy){
        if(JSON.parse(searchHistroy)){
          getLocal = JSON.parse(searchHistroy);

              if (getLocal.length > 4) {

                  for (i = 0; i < 4; i++) {
                      if(getLocal[i] !== getLocal[i-1]){
                          limitLocal.push(getLocal[getLocal.length - i - 1]);
                      }
                  }

              } else {

                  for (i = 0; i < getLocal.length; i++) {
                      if(getLocal[i]!==getLocal[i-1]){
                          limitLocal.push(getLocal[getLocal.length - i - 1]);
                      }
                  }

              }
            var histroyIndex = 0;
            limitLocal.forEach(function(){
                $('.locbody').append("<div class='loclist'></div>");
                $('.loclist').last().html(limitLocal[histroyIndex]);
                histroyIndex++;
            })
            $('.loclist').bind('touchend',function(){
                numbertewo = $(this).html().substr(1);
                startsearch(numbertewo);
            })

        }

       }
   var  numbertewo=null;
    $('.lochtright').bind('touchstart',function(){

        localStorage.removeItem("history")
        $('.loclist').css({display:'none'})
        getLocal = [];
        limitLocal=[];
    })

    $('.Btn_search').bind('touchstart',startsearch)
    function startsearch(){






        plateId = $(".platePrefix").html() + $(".plateInput").val();

        getLocal.push(plateId);
        getSearchHistroy=JSON.stringify(getLocal);

        localStorage.setItem("history",getSearchHistroy);





        /* if($(".plateInput").val().length<5){
         alert('请输入完整的车牌');
         return
         }*/


        var searchCarUrl = "http://106.75.7.176:8080/carseeker/reverseSearchCar/searchCarpostion?parkId=833&plateId=" + plateId.substr(1);
        $.ajax({
            type: "get",
            url: searchCarUrl,
            dataType: "JSON",
            success: function(mmoc) {
                   res=JSON.parse(mmoc);

                if (res.positions.length !== 0) {
                    console.log(res);

                    $('#map').css({display:'block'})

                    $('.InputWrap').css({display:'none'});
                    $('.InputHeader').css({display:'block'})
                    $('.FootBarOne').css({display:'block'})
                    $('.wrapMes').css({display:'block'});
                    $('.floorControl').css({display:'block'});
                    $('.locatinPositon').css({display:'block'});
                    $('.carnumber').html(plateId);
                    $('.lochistory').css({display:'none'});

                    /*  $('.zoomControl').css({display:'block'})*/






                    var carPosition = res.positions[0].positions.code;
                    console.log(carPosition);

                    carPositionPoi = carPosition[2];
                    toFloormm = carPosition[1];
                    positionRealName=res.positions[0].positions.displayName;
                    $('.MessageOne em').html(positionRealName);
                    $('.CmMessage').css({display:'none'});
                    console.log(carPosition);
                    /*  $('.floorId').html(carPosition.codeName[1]);*/
                    $('.plateId').html(positionRealName);
                    if(toFloormm==866891){
                        $('.divone').css({color:"#5b9f92"})
                    }else if(toFloormm==866510){
                        $('.divtwo').css({color:"#5b9f92"})
                    }else{
                        $('.divthree').css({color:"#5b9f92"})
                    }

                    if (control.getCurrentFloor() === toFloormm) {
                        toLatlng = NGR.FeatureLayerUtils.getInnerPointByLayer(NGR.polygon(layers.area._featureLayers[carPositionPoi]._latlngs));

                        control.setCurrentFloor(toFloormm,loadPlanarGraph(toFloormm));
                        CarMarker = NGR.marker(toLatlng, {
                            icon: carIcon
                        });
                        CarMarker.addTo(map);

                    } else {
                        datasource.requestPlanarGraph(toFloormm).then(function(layerInfo) {
                                var tempFeatureLayers = NGR.featureLayer(layerInfo, {
                                    layerType: 'Area'
                                });
                                toLatlng = NGR.FeatureLayerUtils.getInnerPointByLayer(NGR.polygon(tempFeatureLayers._featureLayers[carPositionPoi]._latlngs));
                                control.setCurrentFloor(toFloormm,loadPlanarGraph(toFloormm));
                                CarMarker = NGR.marker(toLatlng, {
                                    icon: carIcon
                                });
                                CarMarker.addTo(map);

                            },
                            function (reason) {
                                alert("未找到车位");
                            });
                    }
                } else {
                    alert("未找到车位！");
                }

            },
            error: function(errmsg) {
                console.log(errmsg);

                alert("请求失败！");
            }


        });




    }


    routineLayer = NGR.layerGroup();
    var floorMap={};
    var floorAddressArray = [];


    locationProvider = new NGR.LocationProvider({
        appKey: "12fb8f0bedd843a5b532a923f3efa650"
    });
    map._core_map.zoomControl.setPosition('bottomright');


    /*var startIcon = NGR.icon({
     iconUrl: 'assets/images/marker_start@2x.png',
     iconSize: [25, 32],
     shadowUrl: 'assets/images/marker_shadow@2x.png',
     shadowSize: [25, 5],
     shadowAnchor: [12, -13]
     });

     var destIcon = NGR.icon({
     iconUrl: 'assets/images/marker_car.png',
     iconSize: [25, 32],
     shadowUrl: 'assets/images/marker_shadow@2x.png',
     shadowSize: [25, 5],
     shadowAnchor: [12, -13]
     });
     */


    loadPlanarGraph = function(planarGraphId) {
        datasource.requestPlanarGraph(planarGraphId).then(function(layerInfo) {

            map.clear();
            NGR.IO.fetch({
                url: './style.json',
                onsuccess: JSON.parse
            }).then(function(style) {
                window._style=style;
                layers.frame = NGR.featureLayer(layerInfo, {
                    layerType: 'Frame',
                    styleConfig: style
                });
                map.addLayer(layers.frame);
                layers.area = NGR.featureLayer(layerInfo, {
                    layerType: 'Area',
                    styleConfig: style
                });
                map.addLayer(layers.area);
                layers.areaText = NGR.featureLayer(layerInfo.Area, {
                    layerType: 'AreaText',
                    styleConfig: style
                });
                map.addLayer(layers.areaText);

                map._core_map.whenReady(function() {

                    map.setZoom(20)
                    map.setMinZoom(20)
                    map.setMaxZoom(21)


                });
                map.setMaxBounds(layers.frame.getBounds());
                if(control.getCurrentFloor()===toFloormm){
                    map.setZoom(20);


                    CarMarker=NGR.marker(toLatlng, {
                        icon:carIcon
                    });
                    CarMarker.addTo(map);


                    var polygon=NGR.polygon(layers.area._featureLayers[carPositionPoi]._latlngs);
                    var mmoction=NGR.FeatureLayerUtils.getInnerPointByLayer(NGR.polygon(layers.area._featureLayers[carPositionPoi]._latlngs));

                    polygon.setStyle({fillColor: '#f4c9d5'});
                    polygon.addTo(map);
                }
                map.render();

                if(control.getCurrentFloor() == fromFlooroo){

                    startMarker = NGR.marker(fromLatlngoo, {
                        icon: destIcon
                    });

                    startMarker.addTo(map);

                    navi();
                }
                if(control.getCurrentFloor() == toFlooroo){
                    destMarker = NGR.marker(toLatlngoo, {
                        icon: destIcon
                    });

                    destMarker.addTo(map);

                    navi();
                }

                /* if(control.getCurrentFloor()===fromFlooroo){

                 if(!startMaker){
                 startMarker.addTo(map);
                 }
                 }
                 if(startMarker && destMarker){
                 navi();
                 }*/

                if (window._marker){

                    map.removeLayer(window._marker);
                }
                window._marker = null;
                var ci = window.clearInterval(window._locinterval);
                this.lastMarkerLatLng = null;
                this.pointSwitch = true;

                if (locFlag) {
                    wx.onSearchBeacons({

                        complete: function(beaconsJson) {

                            var data;
                            bleLocation.locate(convertBeaconsFormat(beaconsJson.beacons));
                            data = bleLocation.getBleLocationInfo();

                            macLatLng = NGR.CRS.EPSG3857.unproject(NGR.point(data.features[0].geometry.coordinate));


                            locFloor = data.features[0].properties.floor_id;



                            renderMarker = function(){
                                if (!window._marker) {
                                    options = {
                                        icon: new NGR.Icon({
                                            iconUrl: 'http://smartapp.alihive.com/static/src/images/images/ico_mylocation@3x.png',
                                            iconSize: [60, 60]
                                        })
                                    };

                                    window._marker = NGR.marker(NGR.CRS.EPSG3857.unproject(NGR.point(data.features[0].geometry.coordinate)), options);
                                    window._marker.addTo(map);
                                    return ;
                                }else {

                                    var moveAnimation = function(lastLatLng, currentLatLng) {

                                        lastMarkerLatLng = currentLatLng;
                                        var moveLatStep = (lastLatLng.lat - currentLatLng.lat) / 100;
                                        var moveLngStep = (lastLatLng.lng - currentLatLng.lng) / 100;

                                        window._moveStep = [];
                                        for (var i = 1; i <= 100; i++) {
                                            window._moveStep.push({
                                                "lat":lastLatLng.lat - moveLatStep * i,
                                                "lng":lastLatLng.lng - moveLngStep * i
                                            });
                                        }
                                        window._intervalStep = 0;
                                        this.pointSwitch = true;

                                        window._locinterval = window.setInterval("if(this.pointSwitch){this.lastMarkerLatLng = window._moveStep[window._intervalStep]; window._marker.setLatLng(this.lastMarkerLatLng); if(window._intervalStep>=99){this.pointSwitch = false; var ci = window.clearInterval(window._locinterval);}else{window._intervalStep++;}}", 50);
                                    };


                                    var forReturn = function(data){

                                        if (!lastMarkerLatLng){
                                            lastMarkerLatLng = data;
                                        }

                                        moveAnimation(lastMarkerLatLng, data);

                                    };
                                    return forReturn(NGR.CRS.EPSG3857.unproject(NGR.point(data.features[0].geometry.coordinate)));
                                }
                            };

                            licationcontrol=parseInt(control.getCurrentFloor());



                            if(licationcontrol == parseInt(locFloor)) {


                                this.pointSwitch = false;

                                var ci = window.clearInterval(window._locinterval);
                                renderMarker();
                            }

                        }
                    });
                }









            });
        }).fail(function(e) {
            return console.error(e, e.stack);
        });
    };

    var locFlag = false;
    var stableFloor = null;
    var stable = false;
    var scanTimeTamp=null;
   wx.ready(function () {

        wx.startSearchBeacons({
            ticket: "",
            complete: function (argv) {


                locFlag = true;


            }
        });
    });

    var convertBeaconsFormat = function (beacons) {
        // alert(JSON.stringify(beacons));
        beacons.forEach(function (beacon) {
            if (!beacon.distance && beacon.accuracy) {
                beacon.distance = beacon.accuracy;
            }
        });
        return beacons;
    };


    $('.divone').bind('touchend',function(){
        control.fire('change',{
            form:control.getCurrentFloor(),
            to:866891
        })

    })
    $('.divtwo').bind('touchend',function(){
        control.fire('change',{
            form:control.getCurrentFloor(),
            to:866510
        })

    })
    $('.divthree').bind('touchend',function(){
        control.fire('change',{
            form:control.getCurrentFloor(),
            to:866188
        })

    })
    $('.floorControl div').bind('touchend',function(){
        $(this).css({color:"#5b9f92"}).siblings().css({color:"#a4a4a4"})
    })




    var startIcon = NGR.icon({
        iconUrl: 'http://smartapp.alihive.com/static/src/images/images/ico_pin_start@2x.png',
        iconSize: [30, 38],
        shadowUrl: 'http://smartapp.alihive.com/static/src/images/images/marker_shadow@2x.png',
        shadowSize: [25, 5],
        shadowAnchor: [12, -13]
    });

    var destIcon = NGR.icon({
        iconUrl: 'http://smartapp.alihive.com/static/src/images/images/ico_pin_dest@2x.png',
        iconSize: [30, 38],
        shadowUrl: 'http://smartapp.alihive.com/static/src/images/images/marker_shadow@2x.png',
        shadowSize: [25, 5],
        shadowAnchor: [12, -13]
    });
    var carIcon=NGR.icon({
        iconUrl: 'http://smartapp.alihive.com/static/src/images/images/ico_pin_red@2x.png',
        iconRetinaUrl: 'http://smartapp.alihive.com/static/src/images/images/ico_pin_red@2x.png',
        iconSize: [28, 47],
        shadowUrl: 'http://smartapp.alihive.com/static/src/images/images/marker_shadow@2x.png',
        shadowSize: [25, 5],
        shadowAnchor: [12, -13]
    });

    var windowHeight=$(window).height();
    $('#OutDoorMap').css({height:windowHeight})
    $('.searchPage').css({height:windowHeight})
    $('.LocationPage').css({height:windowHeight});
    $('.indoorMap').css({height:windowHeight})
    $('.InputWrap').css({height:windowHeight})
    $('.controlel').css({height:windowHeight})

    $('.OutDoorInput').bind('touchstart',function(){
        $('#map').css({display:'none'})
        $('#OutDoorMap').css({display:'none'});
        $('.searchPage').css({display:'block'});
    })
    $('.spanTwo').bind('touchstart',function(){
        $('.FootBarOne').css({display:'none'})
        $('.InputHeader').css({display:'none'})
        $('#map').css({display:'none'})
        $('#OutDoorMap').css({display:'none'});
        $('.LocationPage').css({display:'block'})

    })
    $('.LocaIcone').bind('touchstart',function(){
        $('#map').css({display:'block'})
        $('.LocationPage').css({display:'none'})
        $('.InputHeader').css({display:'block'})
        $('#OutDoorMap').css({display:'block'})
        $('.FootBarOne').css({display:'block'})
        $('.locatinPositon').css({display:'block'})
    })
    $('.spanOne').bind('touchstart',function(){
        location.href="http://Parking.ipalmap.com"
    })
    var parkOnff=true;
    $('.footIcotwo').bind('touchstart',function(){
        if(parkOnff){
            $('.ParkingMes').css({display:'block'})
            parkOnff=false;
        }else {
            $('.ParkingMes').css({display:'none'})
            parkOnff=true;
        }
    })

    var startMaker=null;


    var routinesLayer = null;
    var routines=null;
    var routinesLayer=null;
    var latOne=null;
    var latTwo=null;


    var navi= function () {


        naviProvider.setFrom(fromLatlngoo, fromFlooroo);
        naviProvider.setDestination(toLatlngoo, toFlooroo);
        naviProvider.navigate().then(function() {


            var routines = naviProvider.getRoutinesOnPlanarGraph(control.getCurrentFloor());

            /*console.log(routines);


             console.log(routines.Navi.features[0].geometry.coordinates[0][0]);
             console.log(routines.Navi.features[0].geometry.coordinates[0].length);*/
            /* latOne=NGR.CRS.EPSG3857.unproject(NGR.point(routines.features[0].geometry.coordinates[0][routines.features[0].geometry.coordinates[0].length - 1]));
             latTwo=NGR.CRS.EPSG3857.unproject(NGR.point(routines.Navi.features[0].geometry.coordinates[0][0]));*/
            /*console.log(latOne+'+'+latTwo)*/

            if (routines.Navi.features[0].geometry.coordinates[0].length !== 0) {
                /*destMarker.setLatLng(NGR.CRS.EPSG3857.unproject(NGR.point(routines.features[0].geometry.coordinates[0][routines.features[0].geometry.coordinates[0].length - 1])));*/
                /* console.log(NGR.point(routines.features[0].geometry.coordinates[0][0]));*/
                /* startMarker.setLatLng(NGR.CRS.EPSG3857.unproject(NGR.point(routines.Navi.features[0].geometry.coordinates[0][0])));*/
                latOne = NGR.CRS.EPSG3857.unproject(NGR.point(routines.Navi.features[0].geometry.coordinates[0][0]));
                latTwo = NGR.CRS.EPSG3857.unproject(NGR.point(routines.Navi.features[0].geometry.coordinates[0][routines.Navi.features[0].geometry.coordinates[0].length - 1]))
                /* latTwo=NGR.CRS.EPSG3857.unproject(NGR.point(routines.features[0].geometry.coordinates[0][routines.features[0].geometry.coordinates[0].length - 1]));*/

                routinesLayer = NGR.featureLayer(routines, {
                    layerType: 'Navi',
                    styleConfig: window._style
                });
                map.addLayer(routinesLayer);


            }






        });
        /* startMarker.addTo(map);
         destMarker.addTo(map);*/
        $('.MessageTwo').css({display:'none'});
        $('.endLocation').css({display:'block'})
    };

    $(".locatinPositon").click(function () {

        if (locFloor) {


            if (control.getCurrentFloor() !== locFloor) {
                control.fire('change', {
                    from: control.getCurrentFloor(),
                    to: locFloor
                });
            }
            map.panTo(macLatLng);
        } else {
            alert("没有定位信息！");
        }
    });
    $('.spanOne').bind('touchstart',function(){

    })
    $('.catlageone').bind('touchstart',function(){

    })












})


