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

var pins = 
	[ "http://maps.google.com/mapfiles/marker.png",
	  "http://maps.google.com/mapfiles/marker_green.png",
	  "http://maps.google.com/mapfiles/marker_black.png",
	  "http://maps.google.com/mapfiles/marker_grey.png",
	  "http://maps.google.com/mapfiles/marker_orange.png",
	  "http://maps.google.com/mapfiles/marker_white.png",
	  "http://maps.google.com/mapfiles/marker_yellow.png",
	  "http://maps.google.com/mapfiles/marker_purple.png"];
var colors = 
	[ "#FF0000",
	  "#00FF00",
	  "#000000",
	  "#888888",
	  "#FF8800",
	  "#000000",
	  "#880000",
	  "#008888",
	 ];

var map = {
	map: null,
    myLoc: null,
	marker: null,
	drawTrack: function(points, gpsDevice) {
		var devicePoints = [];
		for(var point in points) {
			devicePoints.push({lat: points[point].lat, lng: points[point].lng});
		}
		if(devicePoints.length > 0) {
			gpsDevice.path = new google.maps.Polyline({
				path: devicePoints,
				geodesic: true,
			    strokeColor: gpsDevice.trackColor,
			    strokeOpacity: 1.0,
			    strokeWeight: 2
			});
			gpsDevice.path.setMap(map.map);
		}
	},
    setMarker: function(loc, gpsDevice) {
    	console.log(gpsDevice.deviceId);
    	if(loc !== null && typeof loc.lat !== 'undefined') {
			var latLng = new google.maps.LatLng(loc.lat, loc.lng);
	    	
			if(gpsDevice.marker instanceof google.maps.Marker) {
				console.log("Repositioning this device");
				var devicePoints = [];
				if(!(gpsDevice.path instanceof google.maps.Polyline)) {
					var currLatLng = gpsDevice.marker.getPosition();
					devicePoints.push({lat: currLatLng.lat(), lng: currLatLng.lng()});
				} else
					devicePoints = gpsDevice.path.getPath().getArray();
				devicePoints.push({lat: loc.lat, lng: loc.lng});
				if(!(gpsDevice.path instanceof google.maps.Polyline)) {
					map.drawTrack(devicePoints, gpsDevice);
				} else
					gpsDevice.path.setPath(devicePoints);
				gpsDevice.marker.setPosition(latLng);
			} else {
				console.log("First time for this device");
				gpsDevice.marker = new google.maps.Marker({
		    		position: latLng,
		    		map: map.map,
		    		icon: gpsDevice.pin,
		    		title: gpsDevice.name
		    	});
		    	//map.map.panTo(latLng);
		    	var mapBounds = map.map.getBounds();
		    	mapBounds.extend(latLng);
		    	map.map.fitBounds(mapBounds);
			}
    	}
    },
    setFence: function(path, id) {
    	var devices = JSON.parse(localStorage.getItem('devices'));
    	gpsDevices = [];
    	for(var i =0; i < devices.length; i++)
    		gpsDevices.push(devices[i].deviceId);
    	var opts = { furtrackgps: 'setfence', points: JSON.stringify(path), devices: gpsDevices, client: device.uuid };
    	if(id !== undefined)
    		opts.id = id;
        console.log(opts);
    	// Add fence on server
    	/*
        $.ajax({
      	  type: "POST",
      	  url: app.serverProto + '://' + app.server + '/',
      	  data: opts,
      	  dataType: "json",
      	  success: function(data) {
      		  var fence = { path: path, id: data.id };
      		  localStorage.setItem("fence", JSON.stringify(fence));
    	  },
      	});
      	*/
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
                
        // Get fence from local storage and update server        
        var fence = JSON.parse(localStorage.getItem('fence'));
        if(fence !== null) {
	        var polygon = new google.maps.Polygon({
				   path: fence.path,
				   strokeWeight: 0,
				   fillColor: '#000000',
				   fillOpacity: 0.3,
				   editable: true
		   });
		   polygon.setMap(map.map);
		   
		   var path = polygon.getPath();
		   
		   google.maps.event.addListener(path, 'set_at', function(pointNr, latLng) { 
			   map.setFence(polygon.getPath().getArray(), fence.id);
		   } );
		   google.maps.event.addListener(path, 'insert_at', function(pointNr, latLng) { 
			   map.setFence(polygon.getPath().getArray(), fence.id);
		   } );
	   
	       var furtrackApiOpts = $.param({furtrackgps: 'getfence', id: fence.id});
	       $.ajax({ url: app.serverProto + '://' + app.server + '/?' + furtrackApiOpts, 
	        	success: function(data) {
	        		// Fence found
	        		// Update fence
	        		map.setFence(path.getArray(), fence.id);
	        	},
			    error: function() {
			    	// Fence not found
			    	map.setFence(path.getArray());
			    },
	        	dataType: "json"
	            });
        }

        // End update server fence
        
        var drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: null,
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [
                google.maps.drawing.OverlayType.POLYGON,
              ],
            },
            polygonOptions: {
          	  strokeWeight: 0,
				  fillColor: '#000000',
				  fillOpacity: 0.3,
				  editable: true
            }
        });
        drawingManager.setMap(map.map);
        
        google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
            drawingManager.setDrawingMode(null);
            map.setFence(polygon.getPath().getArray());
        });
        
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
	                    moveMe();
	                }, function(error) {
	                    // ...
	                });
	            }, 2000);
	        })();
        }

        var gpsDevices = JSON.parse(localStorage.getItem('devices'));
        
        if(gpsDevices !== null) {
        	for(var i = 0; i < gpsDevices.length; i++) {
        		var gpsDevice = gpsDevices[i];
        		gpsDevice.pin = new google.maps.MarkerImage(pins[i - Math.floor(i / pins.length) * pins.length],
        			    new google.maps.Size(21, 34),
        			    new google.maps.Point(0,0),
        			    new google.maps.Point(10, 34));
        		gpsDevice.trackColor = colors[i - Math.floor(i / colors.length) * colors.length];
		        (function poll(gpsDevice, drawPath) {
		     	   setTimeout(function() {
		     		   var furtrackApiOpts = {
		     			  furtrackgps: 'location',
		     			  ident: gpsDevice.deviceId,
		     		   };
		     		   // The duration is defined in minutes
		     		   if(drawPath === true)
		     			   furtrackApiOpts.duration = 1440; // Get 24 hours worth of track data
		     		   furtrackApiOpts = $.param(furtrackApiOpts);
		     		   $.ajax({ url: app.serverProto + '://' + app.server + '/?' + furtrackApiOpts, success: function(data){
		     			   if(drawPath === true) {
		     				   if(data.points.length > 0) {
		     					   map.drawTrack(data.points, gpsDevice);
		     					   map.setMarker(data.points[0], gpsDevice);
		     				   }
		     			   } else
		     				   map.setMarker(data.loc, gpsDevice);
		     			   if(null !== data.status && null !== data.status.battery)
		     				   devices.setBatteryLevel(data.status.battery, gpsDevice);
		     			   poll(gpsDevice ,false);
		     		   }, dataType: "json"});
		     	   }, 5000);
		        })(gpsDevice, true);
        	}
        }
    },
    onError: function() {
    	map.onSuccess(null);
    },
    // Update map on a Received Event
    loadMapsApi: function() {

//        app.onMapsApiLoaded();
        var mapsApiOpts = $.param({
        		key: 'AIzaSyDosZ5H7pKXLwXRmq2eJ3AOjDX7CT7TcPs',
        		sensor: 'true',
        		libraries: 'drawing',
        		callback: 'map.onMapsApiLoaded'
        	});
        $.getScript('https://maps.googleapis.com/maps/api/js?' + mapsApiOpts,
         function() { console.log('Got script'); })
         .fail(function(e) { console.log('Failed to get script'); });
    },
    onMapsApiLoaded: function() {
        console.log('onMapsApiLoaded');
        navigator.geolocation.getCurrentPosition(map.onSuccess, map.onError,{enableHighAccuracy:true, timeout:3000});
    },
};