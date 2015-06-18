var DBus = require('../');

var dbus = new DBus();

var bus = dbus.getBus('system');

bus.getInterface('org.freedesktop.Avahi', '/', 'org.freedesktop.Avahi.Server', function(err, iface) {

 var service_browser_path = "";
	iface.ServiceBrowserNew['timeout'] = 1000;
	iface.ServiceBrowserNew['finish'] = function(result) {
		console.log(result);
   service_browser_path = result;
	};
	iface.ServiceBrowserNew['error'] = function(result) {
		console.log(result);
	};
	iface.ServiceBrowserNew(-1, -1, "_http._tcp", "local", 0);

});

var proxy_service_browser = function(path){
    bus.getInterface('org.freedesktop.Avahi', path, 'org.freedesktop.Avahi.ServiceBrowser', function(err, iface) {
    iface.on()

	    iface.ServiceBrowserNew['timeout'] = 1000;
	    iface.ServiceBrowserNew['finish'] = function(result) {
		    console.log(result);
       service_browser_path = result;
	    };
	    iface.ServiceBrowserNew['error'] = function(result) {
		    console.log(result);
	    };
	    iface.ServiceBrowserNew(-1, -1, "_http._tcp", "local", 0);

    });
}
