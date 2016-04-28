$('#bar-chart2').on('click',function(){
    if($('#bar-chart').css('display')!='none'){
        //$('#2').html($('#2').html()).show().siblings('#1').hide();
        $('#bar-chart').hide();
        $('#timeline').hide();
        $('#barchart-title').hide();
        $('#map-titles').hide();
        $('#map-bar').show();
        $('#map-map').show();
        $('#map-map2').hide();


    }
    else if($('#bar-chart').css('display')=='none'){
        $('#bar-chart').show();
        $('#timeline').show();
        $('#barchart-title').show();
        $('#map-titles').hide();
        $('#map-bar').hide();
        $('#map-map').hide();
        $('#map-map2').show();
    }
});


$('#stacked-area-chart2').on('click',function(){
    if($('#stacked-area-chart').css('display')!='none'){
        //$('#2').html($('#2').html()).show().siblings('#1').hide();
        $('#stacked-area-chart').hide();
        $('#timeline').hide();
        $('#stacked-titles').hide();
        $('#map-titles').hide();
        $('#map-bar').show();
        $('#map-map').show();
        $('#map-map2').hide();


    }
    else if($('#stacked-area-chart').css('display')=='none'){
        $('#stacked-area-chart').show();
        $('#timeline').show();
        $('#stacked-titles').show();
        $('#map-titles').hide();
        $('#map-bar').hide();
        $('#map-map').hide();
        $('#map-map2').show();

    }
});

$('#force-layout2').on('click',function(){
    if($('#force-layout').css('display')!='none'){
        //$('#2').html($('#2').html()).show().siblings('#1').hide();
        $('#force-layout').hide();
        $('#map-titles').hide();
        $('#map-bar').show();
        $('#map-map').show();
        $('#map-map2').hide();


    }
    else if($('#force-layout').css('display')=='none'){
        $('#force-layout').show();
        $('#map-titles').hide();
        $('#map-bar').hide();
        $('#map-map').hide();
        $('#map-map2').show();

    }
});

$('#map-map2').on('click',function(){
    if($('#map-map2').css('display')!='none'){
        //$('#2').html($('#2').html()).show().siblings('#1').hide();
        $('#map-bar').show();
        $('#map-map').show();
        $('#stacked-area-chart').hide();
        $('#stacked-titles').hide();
        $('#bar-chart').hide();
        $('#barchart-title').hide();
        $('#force-layout').hide();
        $('#map-map2').hide();
        $('#map-titles').show();


    }
    else if($('#map-map2').css('display')=='none'){
        $('#map-titles').hide();
        $('#map-bar').hide();
        $('#map-map').hide();
        $('#map-map2').show();

    }
});


//.siblings('#1').hide();

//jQuery.fn.visible = function() {
//    return this.css('visibility', 'visible');
//};
//
//jQuery.fn.invisible = function() {
//    return this.css('visibility', 'hidden');
//};
//
//$('#bar-chart').on('click',function(){
//    if($('#1').css('visibility')!='hidden'){
//        //$('#2').html($('#2').html()).show().siblings('#1').hide();
//        $('#1').invisible();
//    }
//    else if($('#1').css('visibility')=='hidden'){
//        $('#1').visible();
//    }
//});
//
//$('#stacked-area-chart').on('click',function(){
//    if($('#2').css('visibility')!='hidden'){
//        //$('#2').html($('#2').html()).show().siblings('#1').hide();
//        $('#2').invisible();
//    }
//    else if($('#2').css('visibility')=='hidden'){
//        $('#2').visible();
//    }
//});