var DBus = require('../');

var dbus = new DBus();

var bus = dbus.getBus('system');

var serviceBrowserPath, entryGroupPath;
var server, serviceBrowser, entryGroup;
var itemNewCb, itemRemoveCb;
var deviceList = {}
function setCbFunctions(itemnew, itemremove){
	itemNewCb = itemnew;
	itemRemoveCb = itemremove;
}
function showDeviceList(){
    console.log("=====device list as below=====");
    var cnt = 1;
    for(p in deviceList){
        	// console.log(p + " : ", deviceList[p]);
        	result = deviceList[p]
		interface = result[0]
		protocol = result[1]
		name = result[2]
		stype = result[3]
		domain = result[4]
		host = result[5]
		aprotocol = result[6]
		address = result[7]
		port = result[8]
		txtarray = result[9]
		flags  = result[10]
		var txt = ''
		for(var i=0; i<txtarray.length; i++){
			txt += (txtarray[i] + '; ');
		}		
		console.log(address + ':' + port + ' - ' + '"' + name + '" (' + txt + ')');
    }    
}

function startEntryGroup(path){
	console.log('A new EntryGroup started, path:' + path);		
	bus.getInterface('org.freedesktop.Avahi', path, 'org.freedesktop.Avahi.EntryGroup', function(err, iface) {
		if (err != null){
			console.log(err);
		}
		entryGroup = iface;
		iface.AddService['timeout'] = 1000;
		iface.AddService['error'] = function(err) {
			console.log(err);
		}
		// iface.AddService['finish'] = function(arg) {
		// 	console.log('finish add service.');
		// }
		// address = '192.168.160.176';
		// port = '80';
		// name = 'demo-rio';
		// strarray = ['demo-rio', 'hello'];
		// var byteArray = new Array();
		// for(var i=0; i<strarray.length; i++){
		// 	byteArray.push(stringToByteArray(strarray[i]));
		// }
		// iface.AddService(-1, -1, 0, name, '_http._tcp', '', '', port,  byteArray);
		// iface.Commit();
	});	
}
function createEntryGroup(){
	bus.getInterface('org.freedesktop.Avahi', '/', 'org.freedesktop.Avahi.Server', function(err, iface) {
		iface.EntryGroupNew['error'] = function(err) {
			console.log("EntryGroupNew: " + err);
		}
		iface.EntryGroupNew['timeout'] = 1000;
		iface.EntryGroupNew['finish'] = function(path) {
			startEntryGroup(path);
			entryGroupPath = path;
		};
		iface.EntryGroupNew();
	});
	//server.EntryGroupNew();
}
function entryGroupCommit(name , address, port, strarray){
	//var txtStr = ['hello', 'world'];
	console.log('valueo of strarray', strarray);
	var byteArray = new Array();
	for(var i=0; i<strarray.length; i++){
		byteArray.push(stringToByteArray(strarray[i]));
	}
	entryGroup.AddService(-1, -1, 0, name, '_http._tcp', '', '', port,  byteArray);
	entryGroup.Commit();
}

function startServiceBrowser(path){
	console.log('A new ServiceBrowser started, path:' + path);
	// console.log("server in startServiceBrowser", server);
	bus.getLocalInterface('org.freedesktop.Avahi', path, 'org.freedesktop.Avahi.ServiceBrowser', '../org.freedesktop.Avahi.ServiceBrowser.xml', function(err, iface) {
		if (err != null){
			console.log(err);
		}
		serviceBrowser = iface;

		iface.on('ItemNew', function(arg) {
			//console.log('New:', arg);
			itemNewCb(arguments);
			// console.log(server);
			//server.ResolveService(2, 1, 'TestService', '_http._tcp', 'local', -1, 0);
			// console.log(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], -1, 0);
			server.ResolveService(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], -1, 0);
			//resolve_service(arg[0], arg[1], arg[2], arg[3], arg[4], -1, 0);
		});
		iface.on('ItemRemove', function(arg) {
			// console.log('Remove:');
			itemRemoveCb(arguments)
			// console.log(arguments);
		});
	});
}
function createServiceBrowser(){
	bus.getInterface('org.freedesktop.Avahi', '/', 'org.freedesktop.Avahi.Server', function(err, iface) {
		console.log("server in createServiceBrowser", server);
		// console.log("iface in createServiceBrowser", iface);
		if (err != null){
			console.log(err);
		}
		//server = iface;

		iface.ServiceBrowserNew['error'] = function(err) {
			console.log("ServiceBrowserNew: " + err);
		}
		iface.ServiceBrowserNew['timeout'] = 1000;
		iface.ServiceBrowserNew['finish'] = function(path) {
			startServiceBrowser(path);
			serviceBrowserPath = path;
		};	
		iface.ServiceBrowserNew(-1, -1, '_http._tcp', 'local', 0);
	});
	// console.log("server in createServiceBrowser", server);
	// server.ServiceBrowserNew(-1, -1, '_http._tcp', 'local', 0);
}

function createServer(){
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
		iface.ServiceBrowserNew(-1, -1, '_http._tcp', 'local', 0);

		iface.EntryGroupNew['error'] = function(err) {
			console.log("EntryGroupNew: " + err);
		}
		iface.EntryGroupNew['timeout'] = 1000;
		iface.EntryGroupNew['finish'] = function(path) {
			startEntryGroup(path);
			entryGroupPath = path;
		};
		iface.EntryGroupNew();

		iface.ResolveService['error'] = function(err) {
			console.log("ResolveService: " + err);
		}
		iface.ResolveService['timeout'] = 1000;
		iface.ResolveService['finish'] = function(result) {
			// console.log("ResolveService finish");
			interface = result[0];
			protocol = result[1];
			name = result[2];
			stype = result[3];
			domain = result[4];
			host = result[5];
			aprotocol = result[6];
			address = result[7];
			port = result[8];
			//txt = arrayToString(result[9]);
			txtorig = result[9];
			txt = new Array();
			for(var i=0; i<txtorig.length; i++){
				txt.push(arrayToString(txtorig[i]));
			}
			result[9] = txt;
			flags  = result[10];
	        	deviceList[address] = result;
			// console.log(result);
			// console.log(txt);
	        	//showDeviceList();
		};
		// iface.ResolveService(arg[0], arg[1], arg[2], arg[3], arg[4], -1, 0);//arg[5]

		// console.log("server in createServer:", server);
		// console.log("iface in createServer:", iface);
	});
}

exports.setCbFunctions = setCbFunctions;
exports.createServer = createServer;
exports.createServiceBrowser = createServiceBrowser;
exports.createEntryGroup = createEntryGroup;
exports.showDeviceList = showDeviceList;
exports.entryGroupCommit = entryGroupCommit;

stringToByteArray
function stringToByteArray(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff))
            utf8.push(0xf0 | (charcode >>18), 
                      0x80 | ((charcode>>12) & 0x3f), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}
function arrayToString(array) {
	var result = "";
	for (var i = 0; i < array.length; i++) {
	    result += String.fromCharCode(parseInt(array[i]));
	}
	return result;
}

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
