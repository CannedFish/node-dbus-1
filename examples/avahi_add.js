var DBus = require('../');

var dbus = new DBus();

var bus = dbus.getBus('system');
function toUTF8Array(str) {
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

function add_service(path){
	console.log('path:' + path);		
	bus.getInterface('org.freedesktop.Avahi', path, 'org.freedesktop.Avahi.EntryGroup', function(err, iface) {
		if (err != null){
			console.log(err);
		}
		
		//iface.AddService['timeout'] = 1000;
		iface.AddService['error'] = function(err) {
			console.log(err);
		}
		//iface.AddService['finish'] = function(arg) {
			//console.log(arguments);
		//}
		//var one1=new Array('a', 'b', 'c');	
		//var one2=new Array('a', 'b', 'c', 'd');	
		// var one1=new Array(1,2,3);	
		// var one2=new Array(4,5,6,7);		
		// var two=new Array(2);
		// two[0] = one1;
		// two[1] = one2;
		var txt0 = 'hello';
		var txt = new Array();
		txt.push(toUTF8Array(txt0));
		var bytearray = toUTF8Array(txt0);
        	console.log('txt: '+txt);

		iface.AddService(-1, -1, 0, 'TestService1', '_http._tcp', '', '', 3000,  txt);
		// iface.AddService(-1, -1, 0, 'TestService1', '_http._tcp', 'local', '192.168.160.176', 3000,  txt);
		iface.Commit();
	});
	
}

bus.getInterface('org.freedesktop.Avahi', '/', 'org.freedesktop.Avahi.Server', function(err, iface) {

	iface.EntryGroupNew['timeout'] = 1000;
	iface.EntryGroupNew['finish'] = function(path) {
		add_service(path);
	};
	iface.EntryGroupNew();
	
});
