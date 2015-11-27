/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

window.onerror = function(message, file, line) {
  var error = [];
  error.push('---[error]');
  if (typeof message == "object") {
    var keys = Object.keys(message);
    keys.forEach(function(key) {
      error.push('[' + key + '] ' + message[key]);
    });
  } else {
    error.push(line + ' at ' + file);
    error.push(message);
  }
  alert(error.join("\n"));
};

var map = {
	map: null,
    myLoc: null,
	marker: null,
    setMarker: function(data, device) {
    	console.log(device.deviceId);
		var latLng = new google.maps.LatLng(data.loc.lat, data.loc.lng);
    	
		if(device.marker instanceof google.maps.Marker) {
			console.log("Repositioning this device");
			device.marker.setPosition(latLng);
		} else {
			console.log("First time for this device");
	    	device.marker = new google.maps.Marker({
	    		position: latLng,
	    		map: map.map,
	    		title: device.name
	    	});
	    	map.map.panTo(latLng);
		}
    },
    onSuccess: function(position) {
    	var latLng = null;
    	if(position !== null) {
	    	var lng = position.coords.longitude;
	    	var lat = position.coords.latitude;
	    	
	    	latLng = new google.maps.LatLng(lat, lng);
    	} else {
    		latLng = new google.maps.LatLng(51.5, 0);
    	}
   
        var mapOptions = {
                center: latLng,
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

        map.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        map.myloc = new google.maps.Marker({
            clickable: false,
            icon: new google.maps.MarkerImage('http://maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
                                                    new google.maps.Size(22,22),
                                                    new google.maps.Point(0,18),
                                                    new google.maps.Point(11,11)),
            shadow: null,
            zIndex: 999,
            map: map.map
        });

        if(position !== null) {
            map.myloc.setPosition(latLng);
	        (function moveMe() {
	            setTimeout(function() {
	                navigator.geolocation.getCurrentPosition(function(pos) {
	                    var me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
	                    map.myloc.setPosition(me);
	                    console.log(pos.coords.latitude);
	                    moveMe();
	                }, function(error) {
	                    // ...
	                });
	            }, 2000);
	        })();
        }

        var devices = JSON.parse(localStorage.getItem('devices'));
        
        if(devices !== null) {
        	for(var i = 0; i < devices.length; i++) {
        		var device = devices[i];
		        (function poll(device) {
		     	   setTimeout(function() {
		     		   $.ajax({ url: "http://furtrack.com/?furtrackgps=location&ident=" + device.deviceId, success: function(data){
		     			   map.setMarker(data, device);
		     			   poll(device);
		     		   }, dataType: "json"});
		     	   }, 5000);
		        })(device);
        	}
        }
    },
    onError: function() {
    	map.onSuccess(null);
    },
    // Update map on a Received Event
    loadMapsApi: function() {
    	try{
    		console.log('try');
            var networkState = navigator.connection && navigator.connection.type;

            setTimeout(function(){
                networkState = navigator.connection && navigator.connection.type;

                var states = {};
                states[Connection.UNKNOWN]  = 'Unknown connection';
                states[Connection.ETHERNET] = 'Ethernet connection';
                states[Connection.WIFI]     = 'WiFi connection';
                states[Connection.CELL_2G]  = 'Cell 2G connection';
                states[Connection.CELL_3G]  = 'Cell 3G connection';
                states[Connection.CELL_4G]  = 'Cell 4G connection';
                states[Connection.NONE]     = 'No network connection';

                console.log('Connection type: ' + states[networkState]);
                //alert(states[networkState]);
            }, 500);
        }catch(e){
            console.log(e);
            $.each(navigator, function(key, value){
            	console.log(key+' => '+value);
            });
        }
//        if(navigator.connection.type === Connection.NONE) {
//    	    console.log('No connection');
//            return;
//        } 
        console.log('Calling getScript');
//        app.onMapsApiLoaded();
        $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyDosZ5H7pKXLwXRmq2eJ3AOjDX7CT7TcPs&sensor=true&callback=map.onMapsApiLoaded',
         function() { console.log('Got script'); })
         .fail(function(e) { console.log('Failed to get script'); });
    },
    onMapsApiLoaded: function() {
        console.log('onMapsApiLoaded');
        navigator.geolocation.getCurrentPosition(map.onSuccess, map.onError,{'enableHighAccuracy':true,'timeout':3000});
    }
};

var app = {
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
        //localStorage.setItem("lastname", "Smith");
        //console.log(localStorage.getItem("lastname"));
        map.loadMapsApi();
    },
    onOnline: function() {
        console.log('onOnline');
        app.loadMapsApi();
    },
    onResume: function() {
        console.log('onResume');
        app.loadMapsApi();
    },
    
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
    }
};
