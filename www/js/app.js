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

function serverReachable(server) {
    // IE vs. standard XHR creation
    var x = new ( window.ActiveXObject || XMLHttpRequest )( "Microsoft.XMLHTTP" ),
    s;
    x.open(
           // requesting the headers is faster, and just enough
           "HEAD",
           // append a random string to the current hostname,
           // to make sure we're not hitting the cache
           "http://" + server + "/?rand=" + Math.random(),
           // make a synchronous request
           false
           );
    try {
        x.send();
        s = x.status;
        // Make sure the server is reachable
        return ( s >= 200 && s < 300 || s === 304 );
        // catch network & other problems
    } catch (e) {
        return false;
    }
}