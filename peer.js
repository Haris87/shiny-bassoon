var jsonStream = require('duplex-json-stream');
var wrtcSwarm = require('webrtc-swarm');
var streamSet = require('stream-set');
var signalhub = require('signalhub');

var hub = signalhub('test-app-demo', ['https://signalhub-jccqtwhdwc.now.sh']);

var swarm = wrtcSwarm(hub);
var streams = streamSet();
var id = Math.random();
var seq = 0;
var logs = {};


swarm.on('peer', function(friend){
	console.log('[a friend joined]');
	friend = jsonStream(friend);
	streams.add(friend);
	friend.on('data', function(data){
		if(logs[data.log] <= data.seq) return
		logs[data.log] = data.seq;
		console.log(data.username + '> ' + data.message);
		streams.forEach(function(otherFriend){
			otherFriend.write(data);
		});

	})
})

window.chat = function(message){
	var next = seq++;
	streams.forEach(function(friend){
		friend.write({log: id, seq: seq, username: window.username, message: message})
	});
};
