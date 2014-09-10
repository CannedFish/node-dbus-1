var DBus = require('../');

var dbus = new DBus();

var bus = dbus.getBus('system');

var deviceList = {}
function showDeviceList(){
    console.log("=====device list as below=====");
    for(p in deviceList){
        console.log(p + " : ", deviceList[p]);
    }
    console.log();
}

function startEntryGroup(path){
	console.log('path:' + path);		
	bus.getInterface('org.freedesktop.Avahi', path, 'org.freedesktop.Avahi.EntryGroup', function(err, iface) {
		if (err != null){
			console.log(err);
		}
		entryGroup = iface;
		iface.AddService['timeout'] = 1000;
		iface.AddService['error'] = function(err) {
			console.log(err);
		}
		iface.AddService['finish'] = function(arg) {
			console.log(arguments);
		}
	});	
}

function startServiceBrowser(path){
	console.log('path:' + path);		
	bus.getLocalInterface('org.freedesktop.Avahi', path, 'org.freedesktop.Avahi.ServiceBrowser', '../org.freedesktop.Avahi.ServiceBrowser.xml', function(err, iface) {
		if (err != null){
			console.log(err);
		}
		serviceBrowser = iface;

		iface.on('ItemNew', function(arg) {
			console.log('New:');
			//console.log(arguments);
			// resolve_service(arguments);
			server.ResolveService(arg[0], arg[1], arg[2], arg[3], arg[4], -1, 0);//arg[5]
		});
		iface.on('ItemRemove', function(arg) {
			console.log('Remove:');
			console.log(arguments);
			//resolve_service(arguments);
		});
	});
}


var serviceBrowserPath, entryGroupPath;
var server, serviceBrowser, entryGroup;
function createServer(){
	if(server){
		console.log("server is not null");
	}else{
		console.log("server is null");		
	}
	bus.getInterface('org.freedesktop.Avahi', '/', 'org.freedesktop.Avahi.Server', function(err, iface) {
		if (err != null){
			console.log(err);
		}
		server = iface;

		iface.ServiceBrowserNew['error'] = function(err) {
			console.log("ServiceBrowserNew: " + err);
		}
		iface.ServiceBrowserNew['timeout'] = 1000;
		iface.ServiceBrowserNew['finish'] = function(path) {
			startServiceBrowser(path);
			serviceBrowserPath = path;
		};


		iface.EntryGroupNew['error'] = function(err) {
			console.log("EntryGroupNew: " + err);
		}
		iface.EntryGroupNew['timeout'] = 1000;
		iface.EntryGroupNew['finish'] = function(path) {
			startEntryGroup(path);
			entryGroupPath = path;
		};

		iface.ResolveService['error'] = function(err) {
			console.log("ResolveService: " + err);
		}
		iface.ResolveService['timeout'] = 1000;
		iface.ResolveService['finish'] = function(result) {
			interface = result[0]
			protocol = result[1]
			name = result[2]
			stype = result[3]
			domain = result[4]
			host = result[5]
			aprotocol = result[6]
			address = result[7]
			port = result[8]
			txt = result[9]
			flags  = result[10]
	        	deviceList[address] = result;
			console.log(result);
	        	//showDeviceList();
		};
		//iface.EntryGroupNew();
		// iface.ServiceBrowserNew(-1, -1, '_http._tcp', 'local', 0);	
		// iface.ResolveService(arg[0], arg[1], arg[2], arg[3], arg[4], -1, 0);//arg[5]
	});
	if(server){
		console.log("server is not null");
	}else{
		console.log("server is null");		
	}
}
exports.createServer = createServer;
exports.createServiceBrowser = startServiceBrowser;
exports.createEentryGroup = startEntryGroup;
exports.showDeviceList = showDeviceList;

/*
		//var one1=new Array('a', 'b', 'c');	
		//var one2=new Array('a', 'b', 'c', 'd');
		var one1=new Array(1,2,3);	
		var one2=new Array(4,5,6,7);		
		var two=new Array(2);
		two[0] = one1;
		two[1] = one2;
		iface.AddService(-1, -1, 0, 'TestService1', '_http._tcp', '', '', 3000,  two);
		iface.Commit();
*/
/*
function resolve_service(arg){
	bus.getInterface('org.freedesktop.Avahi', '/', 'org.freedesktop.Avahi.Server', function(err, iface) {
		iface.ResolveService['timeout'] = 10000;
		iface.ResolveService['finish'] = function(result) {
			//console.log('---------------------------------------------');
			interface = result[0]
			protocol = result[1]
			name = result[2]
			stype = result[3]
			domain = result[4]
			host = result[5]
			aprotocol = result[6]
			address = result[7]
			port = result[8]
			txt = result[9]
			flags  = result[10]
            	deviceList[address] = result;
			console.log(result);
            	//showDeviceList();
		};
		iface.ResolveService(arg[0], arg[1], arg[2], arg[3], arg[4], -1, 0);//arg[5]
	});
}
*/