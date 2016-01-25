var app = {
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
        $(document).on('online', map.loadMapsApi());
        app.checkConnection();
        setTimeout(function() {
                navigator.splashscreen.hide();
            }, 6000);
        // map.loadMapsApi();
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
        (function poll() {
         setTimeout(
            function() {
                connState = navigator.network.connection.type;
                if(connState != Connection.NONE) {
                    if(serverReachable("furtrack.com")) {
                        $('#no-internet').hide();
                        $(document).trigger('online');
                    } else
                        $('#no-internet').show();
                } else {
                    $('#no-internet').show();
                }
                poll();
            }, 3000);
         })();
    }
};