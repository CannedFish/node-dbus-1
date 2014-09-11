var mdns = require('./zeroconf');
function itemnewcb(arg){
	interface = arg[0]
	protocol = arg[1]
	name = arg[2]
	type = arg[3]
	domain = arg[4]
	flags = arg[5]
	console.log('A new device is add, name: "'+  name + '"');
}
function itemremovecb(arg){
	interface = arg[0]
	protocol = arg[1]
	name = arg[2]
	type = arg[3]
	domain = arg[4]
	flags = arg[5]
	console.log('A device is removed, name: "'+  name + '"');
}
mdns.setCbFunctions(itemnewcb, itemremovecb);
mdns.createServer();

setTimeout(function(){
	name = 'demo-rio';
	address = '192.168.160.176';
	port = '80';
	txtarray = ['demo-rio', 'hello'];
	mdns.entryGroupCommit(name, address, port, txtarray)
}, 2000);


setTimeout(function(){mdns.showDeviceList()}, 4000);

setTimeout(function(){
	mdns.entryGroupReset()
}, 6000);


setTimeout(function(){mdns.showDeviceList()}, 8000);

// setTimeout(function(){mdns.createServiceBrowser()}, 200);
// setTimeout(function(){mdns.createEntryGroup}, 200);