var DBus = require('../');

var dbus = new DBus();

var bus = dbus.getBus('system');

var serviceBrowserPath, entryGroupPath;
var server, serviceBrowser, entryGroup;
var deviceListeners = new Array();
var deviceList = new Object();

function addDeviceListener(cb){
    deviceListeners.push(cb);
}
function removeDeviceListener(cb){
    for(index in deviceListeners){
        if(deviceListeners[index] == cb)
            deviceListeners.splice(index, 1);
        }
}
function callDeviceListener(type, args){
    for(index in deviceListeners){
        deviceListeners[index](type, args);
    }
}
function showDeviceList(){
    console.log("\n=====device list as below=====");
    var cnt = 1;
    var obj;
    for(address in deviceList){
        obj = deviceList[address]
        var txtarray = obj.txt
        var txt = ''
        for(var i=0; i<txtarray.length; i++){
            txt += (txtarray[i] + '; ');
        }        
        console.log(obj.address + ':' + obj.port + ' - ' + '"' + obj.name + '" (' + txt + ')');
    }    
}
function deleteDeviceList(name){
    var obj;
    for(address in deviceList){
            // console.log(p + " : ", deviceList[p]);
            obj = deviceList[address]
            if(obj.name == name){
                delete deviceList[address];
            }
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
        //     console.log('finish add service.');
        // }

        // address = '192.168.160.176';
        // port = '80';
        // name = 'demo-rio';
        // strarray = ['demo-rio', 'hello'];
        // var byteArray = new Array();
        // for(var i=0; i<strarray.length; i++){
        //     byteArray.push(stringToByteArray(strarray[i]));
        // }
        // iface.AddService(-1, -1, 0, name, '_http._tcp', '', '', port,  byteArray);
        // iface.Commit();
    });    
}
function entryGroupCommit(name , address, port, strarray){
    //var txtStr = ['hello', 'world'];
    // console.log('value of entryGroupCommit: ', name , address, port, strarray);
    var byteArray = new Array();
    for(var i=0; i<strarray.length; i++){
        byteArray.push(stringToByteArray(strarray[i]));
    }
    entryGroup.AddService(-1, -1, 0, name, '_http._tcp', '', '', port,  byteArray);
    entryGroup.Commit();
}
function entryGroupReset(){
    entryGroup.Reset();
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
            server.ResolveService(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], -1, 0);
            callDeviceListener('ItemNew', arguments);
            //server.ResolveService(2, 1, 'TestService', '_http._tcp', 'local', -1, 0);
        });
        iface.on('ItemRemove', function(arg) {
            // console.log('Remove:');
            var interface = arguments[0];
             var protocol = arguments[1];
             var name = arguments[2];
             var type = arguments[3];
             var domain = arguments[4];
             var flags = arguments[5];
            deleteDeviceList(name);
            callDeviceListener('ItemRemove', arguments);
            // console.log(arguments);
        });
    });
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
            obj = new Object();
            obj.interface = result[0];
            obj.protocol = result[1];
            obj.name = result[2];
            obj.stype = result[3];
            obj.domain = result[4];
            obj.host = result[5];
            obj.aprotocol = result[6];
            obj.address = result[7];
            obj.port = result[8];
            txtorig = result[9];
            txt = new Array();
            for(var i=0; i<txtorig.length; i++){
                txt.push(arrayToString(txtorig[i]));
            }
             obj.txt = txt;
             obj.flags  = result[10];
             deviceList[obj.address] = obj;
             // console.log(result);
             //showDeviceList();
        };
        // iface.ResolveService(arg[0], arg[1], arg[2], arg[3], arg[4], -1, 0);

        // console.log("server in createServer:", server);
        // console.log("iface in createServer:", iface);
    });
}

exports.addDeviceListener = addDeviceListener;
exports.removeDeviceListener = removeDeviceListener;
exports.createServer = createServer;
exports.showDeviceList = showDeviceList;
exports.entryGroupCommit = entryGroupCommit;
exports.entryGroupReset = entryGroupReset;
// exports.createServiceBrowser = createServiceBrowser;
// exports.createEntryGroup = createEntryGroup;

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
// interface = result[0]
// protocol = result[1]
// name = result[2]
// stype = result[3]
// domain = result[4]
// host = result[5]
// aprotocol = result[6]
// address = result[7]
// port = result[8]
// txtarray = result[9]
// flags  = result[10]