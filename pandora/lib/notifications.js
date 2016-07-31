function notify(payload){
	if(!("Notification" in window)){
		console.warn("Notifications not supported.");
	}
	else if(Notification.permission === 'granted'){
		sendNotification(payload);
	}
	else if(Notification.permission !== 'denied'){
		Notification.requestPermission(function(permission){
			if(permission === 'granted'){
				sendNotification(payload);
			}
		});
	}
	else{
		console.warn("Notification permissions rejected.");
	}
}

function sendNotification(payload){
	if(payload.message){
		if(!payload.icon){
			payload.icon = 'style/img/prometheus-logo.png'
		}
		var n = new Notification(payload.message, payload);
		if(payload.clickFn){
			n.onclick = function(event){
				event.preventDefault();
				payload.clickFn();
			}
		}
	}
	else{
		var n = new Notification(payload);
	}
}

/*notify({
	message: "Connection Established",
	body: "You are now tracking your website analytics in real time.",
	clickFn: function(){
		renderErrorModule();
	}
});*/