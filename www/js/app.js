window.onerror = function(message, file, line) {
  var error = [];
  error.push('---[error]');
  if (typeof message == "object") {
    var keys = Object.keys(message);
    keys.forEach(function(key) {
      error.push('[' + key + '] ' + message[key]);
    });
  } else {
    error.push('Error in file \'' + file + '\' on line ' + line);
    error.push(message);
  }
  alert(error.join("\n"));
};

if(typeof(device) == 'undefined') {
	var device = {
			platform: 'web',
			uuid:     '0',
	};
}

function serverReachable(server, proto) {
    // IE vs. standard XHR creation
	var x = new ( window.ActiveXObject || XMLHttpRequest )( "Microsoft.XMLHTTP" );
    x.onreadystatechange = function() {
    	try {
	        s = x.status;
	        if(x.readyState == 4)
	            if(s >= 200 && s < 300 || s === 304 ) {
	                $('#no-internet').hide();
	                $(document).trigger('online');
	            } else {
	                $('#no-internet').show();
	                console.log('Could not connect to ' + app.server);
	            }
    	} catch(e) {
    		// Could not get connectivity state
    	}
    	
    }
    x.open(
           // requesting the headers is faster, and just enough
           "HEAD",
           // append a random string to the current hostname,
           // to make sure we're not hitting the cache
           proto + "://" + server + "/?rand=" + Math.random(),
           // make a asynchronous request
           true
           );
    try {
        x.send();
    } catch(e) {
        
    }
}