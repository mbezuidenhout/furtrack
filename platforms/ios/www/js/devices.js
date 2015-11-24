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
var app = {
	x: null,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        //document.addEventListener('deviceready', this.onDeviceReady, false);
    	$(document).bind('deviceready', app.onDeviceReady);
    },
    populateDeviceList: function() {
    	var devices = JSON.parse(localStorage.getItem("devices"));
	    for(var i=0;i < devices.length; i++) {
	        var clonedli = $("#clone").clone().appendTo("#device-list");
	        clonedli.removeAttr('id');
	        clonedli.attr('id', 'item' + devices[i].id);
	        if(devices[i].name.length == 0)
	        	clonedli.find('.name').html('&nbsp;');
	        else
	            clonedli.find('.name').text(devices[i].name);
	    }
	    $('.swipe-delete li > a')
	        .on('touchstart', function(e) {
	            //console.log(e.originalEvent.pageX);
	            $('.swipe-delete li > a.open').css('left', '0px').removeClass('open'); // close em all
	            $(e.currentTarget).addClass('open');
	            app.x = e.originalEvent.targetTouches[0].pageX; // anchor point
	        })
	        .on('touchmove', function(e) {
	            var change = e.originalEvent.targetTouches[0].pageX - app.x;
	            change = Math.min(Math.max(-100, change), 100); // restrict to -100px left, 0px right
	            e.currentTarget.style.left = change + 'px';
	            if (change < -10) $(document).on('touchmove', function(e) { e.preventDefault(); } ); // disable scroll once we hit 10px horizontal slide
	        })
	        .on('touchend', function(e) {
	            var left = parseInt(e.currentTarget.style.left);
	            var new_left;
	            if (left < -35) {
	                new_left = '-100px';
	            } else if (left > 35) {
	                new_left = '100px';
	            } else {
	                new_left = '0px';
	            }
	            // e.currentTarget.style.left = new_left
	            $(e.currentTarget).animate({left: new_left}, 200);
	            $(document).unbind('touchmove', function(e) { e.preventDefault(); } );
	        });
	    $('li .delete-btn').on('touchend', function(e) {
	        e.preventDefault();
	        $(this).parents('li').slideUp('fast', function() {
	        	var id = $(this).attr('id').substr(4);
	        	var devices = JSON.parse(localStorage.getItem('devices'));
	        	for(var i=0;i < devices.length; i++) {
	        		if(id == devices[i].id) {
	        		    devices.splice(i, 1);
	        		    break;
	        	    }
	        	}
	            localStorage.setItem("devices", JSON.stringify(devices));
	            $(this).remove();
	        });
	    });
	    $('li .edit-btn').on('touchend', function(e) {
	        //e.preventDefault();
	        //$(this).parents('li').children('a').html('edited');
	    	var id = $(this).closest('li').attr('id').substr(4);
	    	var devices = JSON.parse(localStorage.getItem('devices'));
	    	for(var i = 0; i < devices.length; i++) {
	    		if(devices[i].id == id) {
	    			$('#device-form input[name=id]').val(devices[i].id);
	    	    	$('#device-form input[name=name]').val(devices[i].name);
	    	    	$('#device-form input[name=deviceId]').val(devices[i].deviceId);
	    			break;
	    		}
	    	}
	    });
	    
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    	$("#add").bind('click', function() { $("#device-form").trigger("reset"); } );

    	app.populateDeviceList();
        $('#device-form').bind('submit', function (e) {
            var devices = JSON.parse(localStorage.getItem('devices'));
            var maxId = 0;
            if($(this).find('input[name=id]').val().length > 0) {
            	var newDevice = {id: $(this).find('input[name=id]').val(), name: $(this).find('input[name=name]').val(), deviceId: $(this).find('input[name=deviceId]').val()};
            	for(var i = 0; i < devices.length; i++) {
            		if(devices[i].id == $(this).find('input[name=id]').val())
            			devices.splice(i, 1, newDevice);
            	}
            } else {
	        	if(devices !== null && devices.length > 0) {
	    	        for(var i=0; i < devices.length; i++) {
	    	           	if(devices[i].id > maxId) {
	    	           		maxId = devices[i].id;
	    	           	}
	    	        }
	    	        maxId++;
	        	}
	        	
	        	var newDevice = {id: maxId, name: $(this).find('input[name=name]').val(), deviceId: $(this).find('input[name=deviceId]').val()};
	            if(devices instanceof Array)
	            	devices.push(newDevice);
	            else
	            	devices = new Array(newDevice);
            }
            localStorage.setItem("devices", JSON.stringify(devices));
        });
    },
};
