window.Prometheus = (function(){

var SCREENSHOTS;
var LOCATOR;
var LOCALSAVE = false;
var ANONS; //TO-DO: add boolean to config to toggle tracking anonymous users
var localKey;

function loadHTML2Canvas(){
	var fileRef = document.createElement('script');
	fileRef.setAttribute('type', 'text/javascript');
	fileRef.setAttribute('src', 'https://vingkan.github.io/prometheus/script/html2canvas.min.js');
	document.getElementsByTagName('head')[0].appendChild(fileRef);
}

var Prometheus = function(config){

	// Initialize Firebase with 3.0 API
	firebase.initializeApp(config);

	var project_id = config.databaseURL.split('//')[1].split('.')[0];
	localKey = 'prometheus_user_' + project_id;

	LOCATOR = true;

	if(LOCATOR){
		getGeoIP(updateCoords);
	}

	if(config['localhost'] && config.localhost === true){
		LOCALSAVE = true;
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
				localStorage.setItem(localKey, uid);
			}
		},

		getUID: function(){
			var track = "ANONYMOUS_USER";
			if(this.isTrackingUser()){
				track = localStorage.getItem(localKey);
			}
			return track;
		},

		save: function(dataObj, metaProps){
			var uid = this.getUID();
			var eventData = dataObj || {type: "SAVED_VISIT"};
			var meta = metaProps || 'all';
			var metaData = this.get(meta);
			if(LOCALSAVE === false && metaData.page.url.indexOf('localhost') > -1){
				//Don't save visit.
			}
			else{
				var visitsRoute = createRoute('/visits/' + uid);
				visitsRoute.push({
					meta: metaData,
					visit: eventData
				});
				//Update Last Visit Timestamp
				var lastVisitRoute = createRoute('/users/' + uid + '/lastVisit');
				lastVisitRoute.once('value', function(lastSnap){
					var lastVisit = lastSnap.val();
					if(metaData.datetime.timestamp > lastVisit){
						lastVisitRoute.set(metaData.datetime.timestamp);
					}
				});
			}
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
				if(LOCALSAVE === false && location.hostname.indexOf('localhost') > -1){
					//Don't update profile.
				}
				else if(userData){
					var profileRoute = createRoute('/users/' + uid + '/profile');
					profileRoute.set(userData);
				}
				this.loadFeatures();
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
			var trackedUID = localStorage.getItem(localKey);
			if(trackedUID){
				response = true;
			}
			return response;
		},

		loadFeatures: function(){
			var uid = this.getUID();
			var featureRoute = createRoute('/features');
			featureRoute.on('value', function(snapshot){
				var featureBase = snapshot.val();
				var features = [];
				for(var i in featureBase){
					if(featureBase[i]){
						var feat = featureBase[i];
						for(var j in feat.access){
							if(feat.access[j]){
								if(feat.access[j] === uid){
									features.push(i);
								}
							}
						}
					}
				}
				localStorage.setItem('prometheus_features', features);
			});
		},

		has: function(featureID){
			var response = false;
			var storedFeatures = localStorage.getItem('prometheus_features') || '';
			var features = storedFeatures.split(',');
			if(features.indexOf(featureID) > -1){
				response = true;
			}
			return response;
		},

		//TO-DO: function to change URL of firebase reference

		get: function(request){
			var response = {};
			if(Array.isArray(request) && request.length > 0){
				if(request.indexOf('all') > -1){
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

		can: function(featureID, callback, fallback){
			//Safer Asynchronous Method
			var uid = this.getUID();
			var featureRoute = createRoute('/features/' + featureID + '/');
			featureRoute.once('value', function(featureSnap){
				if(featureSnap.exists()){
					var feature = featureSnap.val();
					var userDataRoute = createRoute('/users/' + uid + '/data');
					userDataRoute.once('value', function(userSnap){
						var userData = {};
						if(userSnap.exists()){
							userData = userSnap.val();
						}
						var result = {};
						if(feature.validate){
							var validateFn = new Function('userData', feature.validate);
							result = validateFn(userData);
						}
						else{
							if(fallback){
								fallback({
									message: "The feature could not be validated.",
									featureID: featureID
								});
							}
						}
						if(result.allowed){
							if(callback){
								callback(result.data);
							}
						}
						else{
							if(fallback){
								fallback(result.data);
							}
						}
					});
				}
				else{
					if(fallback){
						fallback({
							message: "The feature you requested does not exist.",
							featureID: featureID
						});
					}
				}
			});
		},

		deliver: function(featureID, callback, fallback){
			//Safer Asynchronous Method
			prometheus.can(featureID, function(data){
				var uid = prometheus.getUID();
				var featureRoute = createRoute('/features/' + featureID + '/');
				featureRoute.once('value', function(featureSnap){
					if(featureSnap.exists()){
						var feature = featureSnap.val();
						var userDataRoute = createRoute('/users/' + uid + '/data');
						userDataRoute.once('value', function(userSnap){
							var userData = {};
							if(userSnap.exists()){
								userData = userSnap.val();
							}
							var result = {};
							if(feature.process){
								var processFn = new Function('userData', feature.process);
								result = processFn(userData);
								userDataRoute.set(userData);
							}
							else{
								result.data = data;
							}
							if(callback){
								callback(result.data);
							}
						});
					}
					else{
						if(fallback){
							fallback({
								message: "The feature you requested does not exist.",
								featureID: featureID
							});
						}
					}
				});
			}, function(data){
				if(fallback){
					fallback(data);
				}
			});
		},

		redeem: function (code, callback, fallback, options) {
			var settings = options || {};
			var uid = this.getUID();
			var userDataRoute = createRoute('/users/' + uid + '/data/');
			userDataRoute.once('value', function (userSnap) {
				var userData = {};
				if(userSnap.exists()){
					userData = userSnap.val();
				}
				var promos = []
				if(userData.hasOwnProperty('promos')){
					promos = userData.promos;
				}
				if(promos.indexOf(code) < 0){
					var promoRoute = createRoute('/promos/' + code + '/');
					promoRoute.once('value', function (promoSnap) {
						if(promoSnap.exists() && promoSnap.val().hasOwnProperty('redeem')){
							var promoCode = promoSnap.val();
							var redeemFn = new Function('userData', promoCode.redeem);
							promos.push(code);
							userData.promos = promos;
							userDataRoute.set(redeemFn(userData));
							prometheus.save({
								type: "PROMO_CODE_USED",
								code: code
							});
							if(callback){
								callback(promoCode.info);
							}
						}
						else{
							prometheus.save({
								type: "PROMO_CODE_ERROR",
								code: code,
								error: "NOT_FOUND"
							});
							if(fallback){
								fallback({
									type: "NOT_FOUND",
									message: "Promo code not found."
								});
							}
						}
					});
				}
				else{
					if(!settings.silent){
						prometheus.save({
							type: "PROMO_CODE_ERROR",
							code: code,
							error: "ALREADY_USED"
						});
					}
					if(fallback){
						fallback({
							type: "ALREADY_USED",
							message: "Promo code already used."
						});
					}
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
					var noteRoute = createRoute('/users/' + uid + '/data/' + noteID);
					noteRoute.once('value', function(noteSnapshot){
						if(noteSnapshot.exists()){
							noteRoute.remove();
							var data = dataObj || {};
								data['type'] = "NOTIFICATION_TERMINATED";
								data['noteid'] = noteID;
							_this.save(data);
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

		timers: {},

		Timer: function(timerID){
			var _this = this;
			return {
				id: timerID,
				data: {},
				started: false,
				start: function(data){
					if(!this.started){
						this.started = Date.now();
						if(data){
							this.data = data;
						}
					}
				},
				stop: function(data){
					if(this.started){
						var info = {
							type: 'TIMER',
							timerID: this.id,
							start: this.started,
							end: Date.now()
						}
						for(var i in this.data){
							if(this.data.hasOwnProperty(i)){
								info[i] = this.data[i];
							}
						}
						for(var j in data){
							if(data.hasOwnProperty(j)){
								info[j] = data[j];
							}
						}
						_this.save(info);
						_this.timers[timerID] = null;
					}
				}
			}
		},

		timer: function(timerID){
			if(!this.timers[timerID]){
				this.timers[timerID] = this.Timer(timerID)
			}
			return this.timers[timerID];
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

	prometheus.loadFeatures();

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
	//Mobile
	function mobilecheck() {
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	}
	//Mobile or Tablet
	function mobileAndTabletcheck() {
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	}
	//Device Type
	var device = 'desktop';
	if(mobilecheck()){
		device = 'mobile';
	}
	else if(mobileAndTabletcheck()){
		device = 'tablet';
	}
	//Browser
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
	//Screen Size
	var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	return {
		device: device,
		name: M[0],
		version: M[1],
		width: width,
		height: height
	}
}

function getPageData(){
	return {
		title: document.title,
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