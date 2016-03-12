var notify = {
		init: function() {
			
			if(typeof(PushNotification) != 'undefined') {
				var push = PushNotification.init({
		            android: 	{ senderID: "1063922592601", clearNotifications: "true", forceShow: "true"},
		            ios: 		{ alert: "true", badge: "true", sound: "true", clearBadge: "true"},
		            windows: 	{}
		        });
	        
		        push.on('registration', function(data) {
		            //if(localStorage.getItem("deviceToken") != data.registrationId) {
			            // data.registrationId
			        	$.ajax({
			          	  type: "POST",
			          	  url: 'http://furtrack.com/',
			          	  data: {furtrackgps: 'register', token: data.registrationId, devicetype: device.platform, client: device.uuid},
			          	  dataType: "json",
			          	  success: function(data) { localStorage.setItem("deviceToken", data.registrationId); },
			          	});
			        //}
		        });
	
	/*        
	        push.on('notification', function(data) {
	            console.log(data.message);
	            console.log(data.title);
	            console.log(data.count);
	            console.log(data.sound);
	            console.log(data.image);
	            console.log(data.additionalData);
	            alert(data.message);
	        });
	*/
			}
		}
};