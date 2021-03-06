var pins =
[ "http://maps.google.com/mapfiles/marker.png",
  "http://maps.google.com/mapfiles/marker_green.png",
  "http://maps.google.com/mapfiles/marker_black.png",
  "http://maps.google.com/mapfiles/marker_grey.png",
  "http://maps.google.com/mapfiles/marker_orange.png",
  "http://maps.google.com/mapfiles/marker_white.png",
  "http://maps.google.com/mapfiles/marker_yellow.png",
  "http://maps.google.com/mapfiles/marker_purple.png",
  "http://maps.google.com/mapfiles/marker_green.png"];


var app = {
    server: 'furtrack.com',
    serverProto: 'http',
    connState: null,
    // Application Constructor
    initialize: function() {
        console.log('app.initialize');
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        //document.addEventListener('deviceready', this.onDeviceReady, false);
    	$(document).bind('deviceready', app.onDeviceReady);
//        document.addEventListener('online', this.onOnline, false);
//        document.addEventListener('resume', this.onResume, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    	$(window).unbind();
    	$(window).bind('pageshow resize orientationchange', app.onOrientationChange);
        app.onOrientationChange();
        console.log('onDeviceReady');
        notify.init();
        if('Android' == device.platform) {
        	map.loadMapsApi();
        } else {
	        $(document).one('online', map.loadMapsApi );
	        app.checkConnection(app.server, app.serverProto);
        }
        $('#device-form').bind('submit', devices.onSubmitDevices);
        $("#add").bind('click', function() { $("#device-form").trigger("reset"); } );
        
        $(document).on("pagecontainershow", function (event, ui) {
            console.log("Showing " + ui.toPage.attr('id'));
            if('Page1' == ui.toPage.attr('id') && undefined !== google && map.map instanceof google.maps.Map)
                google.maps.event.trigger(map.map, 'resize');
            if(!devices.done && 'Page2' == ui.toPage.attr('id'))
                devices.populateDeviceList();
            } );
    },
    //onOnline: function() {
    //    console.log('onOnline');
    //    app.loadMapsApi();
    //},
    //onResume: function() {
    //    console.log('onResume');
    //    app.loadMapsApi();
    //},
    
    onOrientationChange: function() {
    	console.log('window size change');
        var h = $('div[data-role="header"]').outerHeight(true);
        var f = $('div[data-role="footer"]').outerHeight(true);
        var w = $(window).height();
        var c = $('div[data-role="content"]');
        var c_h = c.height();
        var c_oh = c.outerHeight(true);
        var c_new = w - h - f - c_oh + c_h;
        var total = h + f + c_oh;
        if(c_h<c.get(0).scrollHeight){
            c.height(c.get(0).scrollHeight);
        }else{
            c.height(c_new);
        }
    },
    
    checkConnection: function() {
        (function poll(timeout) {
         setTimeout(
            function() {
                connState = navigator.network.connection.type;
                if(connState != Connection.NONE) {
                    serverReachable(app.server);
                } else {
                    $('#no-internet').show();
                    console.log('Connection state is: ' + connState);
                }
                poll(3000);
            }, timeout);
         })(200);
    }
};
