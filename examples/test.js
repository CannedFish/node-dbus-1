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
	console.log('A new device is add, name: "'+  name + '"');
}
mdns.setCbFunctions(itemnewcb, itemremovecb);
mdns.createServer();

// setTimeout(function(){mdns.createServiceBrowser()}, 200);
// setTimeout(function(){mdns.createEntryGroup}, 200);

// setTimeout(function(){
// 			//var one1=new Array('a', 'b', 'c');	
// 		//var one2=new Array('a', 'b', 'c', 'd');
// 		var one1=new Array(1,2,3);	
// 		var one2=new Array(4,5,6,7);		
// 		var two=new Array(2);
// 		two[0] = one1;
// 		two[1] = one2;
// 		iface.AddService(-1, -1, 0, 'TestService1', '_http._tcp', '', '', 3000,  two);
// 		iface.Commit();
// }, 400);


setTimeout(function(){mdns.showDeviceList()}, 1000);
// mdns.showServer();

