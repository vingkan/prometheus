window.Prometheus = (function(){

var SCREENSHOTS;
var LOCATOR;
var ANONS; //TO-DO: add boolean to config to toggle tracking anonymous users

function loadHTML2Canvas(){
	var fileRef = document.createElement('script');
	fileRef.setAttribute('type', 'text/javascript');
	fileRef.setAttribute('src', 'http://vingkan.github.io/prometheus/script/html2canvas.min.js');
	document.getElementsByTagName('head')[0].appendChild(fileRef);
}

var Prometheus = function(config){

	// Initialize Firebase with 3.0 API
	firebase.initializeApp(config);

	LOCATOR = true;

	if(LOCATOR){
		getGeoIP(updateCoords);
	}

	if(config['noScreenshots'] && config.noScreenshots === true){
		//Disable Screenshots
		SCREENSHOTS = false;
	}
	else{
		//Enable Screenshots
		SCREENSHOTS = true;
		loadHTML2Canvas();
	}

	var prometheus = {

		trackUser: function(uid){
			if(uid){
				sessionStorage.setItem('prometheus_user', uid);
			}
		},

		getUID: function(){
			var track = "ANONYMOUS_USER";
			if(this.isTrackingUser()){
				track = sessionStorage.getItem('prometheus_user');
			}
			return track;
		},

		save: function(dataObj, metaProps){
			var uid = this.getUID();
			var eventData = dataObj || {type: "SAVED_VISIT"};
			var meta = metaProps || 'all';
			var visitsRoute = createRoute('/users/' + uid + '/visits');
			visitsRoute.push({
				meta: this.get(meta),
				visit: eventData
			});
		},

		error: function(errorInfo){
			var dataObj = {
				type: "ERROR",
				message: errorInfo.message,
				url: errorInfo.url,
				line: errorInfo.line
			};
			this.capture(dataObj);
		},

		logon: function(uid, userData, metaProps){
			if(uid){
				this.trackUser(uid);
				if(userData){
					var profileRoute = createRoute('/users/' + uid + '/profile');
					profileRoute.set(userData);
				}
				this.save({type: "USER_LOGON"}, metaProps);
			}
		},

		capture: function(dataObj){
			var dataObj = dataObj || {};
			if(!dataObj['type']){
				dataObj.type = 'SCREEN_CAPTURE';
			}
			var _this = this;
			if(SCREENSHOTS){
				html2canvas(window.parent.document.body, {
					onrendered: function(canvas){
						canvas.style.display = 'none';
						document.body.appendChild(canvas);
						var data = canvas.toDataURL('image/png');
						//document.body.innerHTML += '<img src="' + data + '">';
						dataObj.img = data;
						_this.save(dataObj);
					}
				});
			}
			else{
				dataObj.img_note = "NONE_TAKEN";
				this.save(dataObj);
			}
		},

		isTrackingUser: function(){
			var response = false;
			var trackedUID = sessionStorage.getItem('prometheus_user');
			if(trackedUID){
				response = true;
			}
			return response;
		},

		//TO-DO: function to change URL of firebase reference

		get: function(request){
			var response = {};
			if(Array.isArray(request) && request.length > 0){
				if(request.includes('all')){
					response = getData('all');
				}
				else{
					for(var d = 0; d < request.length; d++){
						var prop = request[d];
						response[prop] = getData(prop);
					}
				}
			}
			else if(request){
				response = getData(request);
			}
			else{
				response = "BAD_REQUEST_EXCEPTION"
			}
			return response;
		},

		deliver: function(featureID, callback, fallback){
			var uid = this.getUID();
			var featureRoute = createRoute('/features/' + featureID + '/access/');
			featureRoute.once('value', function(snapshot){
				var allowed = snapshot.val();
				var executed = false;
				for(var i in allowed){
					if(uid === allowed[i]){
						callback();
						executed = true;
						break;
					}
				}
				if(!executed && fallback){
					fallback();
				}
			});
		},

		Note: function(noteID){
			var _this = this;
			return {
				
				seen: function(dataObj){
					var data = dataObj || {};
						data['type'] = "NOTIFICATION_CLICKED";
						data['noteid'] = noteID;
					_this.save(data);
				},

				terminate: function(dataObj){
					var uid = _this.getUID();
					var noteRoute = createRoute('/features/' + noteID + '/access/');
					noteRoute.once('value', function(snapshot){
						var recipients = snapshot.val();
						for(var r in recipients){
							if(recipients[r] === uid){
								var terminationRef = createRoute('/features/' + noteID + '/access/' + r);
									terminationRef.remove();
								var data = dataObj || {};
									data['type'] = "NOTIFICATION_TERMINATED";
									data['noteid'] = noteID;
								_this.save(data);
								break;
							}
						}
					});
				}

			}
		},

		notify: function(noteID, content, callback){
			var _this = this;
			this.deliver(noteID, function(){
				notify({
					message: content.title || 'Alert',
					body: content.message || '',
					icon: content.icon || config.icon || null,
					clickFn: function(){
						var note = _this.Note(noteID);
						if(callback){
							callback(note);
						}
						else{
							note.seen();
						}
					}
				});
			});
		},

		toString: function(){
			console.log(config);
			return 'Bringing Firebase to humanity!';
		}

	}

	//Track Errors
	window.onerror = function(msg, url, line){
		console.warn('Error recorded by Prometheus.js.');
		prometheus.error({
			message: msg,
			url: url,
			line: line
		});
	}

	return prometheus;

}

/*--------------------------------------------*/
/*---> FIREBASE HANDLING <--------------------*/
/*--------------------------------------------*/

function createRoute(endpoint){
	var route = firebase.database().ref('prometheus' + endpoint);
	return route;
}

/*--------------------------------------------*/
/*---> META DATA RETRIEVAL <------------------*/
/*--------------------------------------------*/

var GEOLOCATION = {
	latitude: 0,
	longitude: 0,
	isValid: false
};

function getGeoIP(callback){
    // to prevent the callback from erroring...
    var geoip = {
        location: {},
        country: {}
    };
	var x = new XMLHttpRequest();
	x.open('GET', 'https://geoip.nekudo.com/api/', false);
    try {
	    x.send();
        var res = x.responseText;
        geoip = JSON.parse(res);
    } catch (e) {
    }
	
	if(callback){
		callback(geoip);
	}
}

function updateCoords(position){
	GEOLOCATION.latitude = position.location.latitude;
	GEOLOCATION.longitude = position.location.longitude;
	GEOLOCATION.city = position.city;
	GEOLOCATION.country = position.country.name;
	GEOLOCATION.ip = position.ip;
	GEOLOCATION.isValid = GEOLOCATION.latitude != null;
}

function getLocationData(){
	var response = "NO_GEOLOCATION_EXCEPTION";
	if(GEOLOCATION.isValid){
		response = {
			latitude: GEOLOCATION.latitude,
			longitude: GEOLOCATION.longitude,
			city: GEOLOCATION.city,
			country: GEOLOCATION.country,
			ip: GEOLOCATION.ip
		}
	}
	return response;
}

function getDateTimeData(){
	return {
		timestamp: Date.now(),
		timezoneOffset: new Date().getTimezoneOffset()
	}
}

/*
 * S/O: http://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
 */
function getBrowserData(){
	var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	if(/trident/i.test(M[1])){
		tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
		return {name:'IE',version:(tem[1]||'')};
		}
	if(M[1]==='Chrome'){
		tem=ua.match(/\bOPR\/(\d+)/)
		if(tem!=null)   {return {name:'Opera', version:tem[1]};}
		}
	M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
	if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
	return {
		name: M[0],
		version: M[1]
	}
}

function getPageData(){
	return {
		url: location.href
	}
}

function getData(dataType){
	var response;
	switch(dataType){
		case 'location':
			response = getLocationData();
			break;
		case 'datetime':
			response = getDateTimeData();
			break;
		case 'browser':
			response = getBrowserData();
			break;
		case 'page':
			response = getPageData();
			break;
		case 'all':
			response = {
				location: getLocationData(),
				datetime: getDateTimeData(),
				browser: getBrowserData(),
				page: getPageData()
			}
			break;
		default:
			response = "BAD_REQUEST_EXCEPTION";
	}
	return response;
}

/*--------------------------------------------*/
/*---> NOTIFICATIONS <------------------------*/
/*--------------------------------------------*/

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
			payload.icon = 'http://vingkan.github.io/prometheus/img/contrast-logo.png';
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

return Prometheus;

}());