window.Prometheus = (function(){

var URL;
var LOCATOR;
var ANONS; //TO-DO: add boolean to config to toggle tracking anonymous users

var Prometheus = function(config){

	//TO-DO: write check to see if '/prometheus' is at the end of url
	URL = config.url || config || "NO_URL_EXCEPTION";
	LOCATOR = config.locator || true;

	if(LOCATOR){
		getGeoIP(updateCoords);
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
			this.save(dataObj);
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
			var featureRoute = createRoute('/features/' + featureID + '/');
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

		toString: function(){
			console.log(config);
			return 'Bringing Firebase to humanity!';
		}

	}

		//Track Errors
	window.onerror = function(msg, url, line){
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
	var route;
	if(URL && URL !== "NO_URL_EXCEPTION"){
		//TO-DO: check that endpoint has leading slash
		route = new Firebase(URL + endpoint);
	}
	else{
		throw new Error(URL, 'prometheus.js');
	}
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
	var x = new XMLHttpRequest();
	x.open('GET', 'https://geoip.nekudo.com/api/', false);
	x.send();
	var res = x.responseText;
	var geoip = JSON.parse(res);
	if(callback){
		callback(geoip);
	}
}

function updateCoords(position){
	GEOLOCATION.latitude = position.location.latitude;
	GEOLOCATION.longitude = position.location.longitude;
	GEOLOCATION.city = position.city;
	GEOLOCATION.country = position.country.name;
	GEOLOCATION.ip = position.ip
	GEOLOCATION.isValid = true;
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

return Prometheus;

}());