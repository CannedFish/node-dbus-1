var mdns = require('./zeroconf');
function itemnewcb(arg){
	var interface = arg[0]
	var protocol = arg[1]
	var name = arg[2]
	var type = arg[3]
	var domain = arg[4]
	var flags = arg[5]
	console.log('A new device is add, name: "'+  name + '"');
}
function itemremovecb(arg){
	var interface = arg[0]
	var protocol = arg[1]
	var name = arg[2]
	var type = arg[3]
	var domain = arg[4]
	var flags = arg[5]
	console.log('A device is removed, name: "'+  name + '"');
}
mdns.setCbFunctions(itemnewcb, itemremovecb);
mdns.createServer();

setTimeout(function(){
	var name = 'demo-rio';
	var address = '192.168.160.176';
	var port = '80';
	var txtarray = ['demo-rio', 'hello'];
	mdns.entryGroupCommit(name, address, port, txtarray)
}, 2000);


setTimeout(function(){mdns.showDeviceList()}, 4000);

setTimeout(function(){
	mdns.entryGroupReset()
}, 6000);


setTimeout(function(){mdns.showDeviceList()}, 8000);

// setTimeout(function(){mdns.createServiceBrowser()}, 200);
// setTimeout(function(){mdns.createEntryGroup}, 200);