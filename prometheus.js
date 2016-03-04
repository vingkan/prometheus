window.Prometheus = (function(){

var GEOLOCATION = {
	latitude: 0,
	longitude: 0,
	isValid: false
};

function updateCoords(position){
	GEOLOCATION.latitude = position.coords.latitude;
	GEOLOCATION.longitude = position.coords.longitude;
	GEOLOCATION.isValid = true;
}

function getLocationData(){
	var response = "NO_GEOLOCATION_EXCEPTION";
	if(GEOLOCATION.isValid){
		response = {
			latitude: GEOLOCATION.latitude,
			longitude: GEOLOCATION.longitude
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

var Prometheus = function(config){

	var URL = config.url || "NO_URL_EXCEPTION";
	var LOCATOR = config.locator || false;

	sessionStorage.setItem('prometheus_user', "NO_USER_TRACKING_EXCEPTION");

	if(LOCATOR){
		navigator.geolocation.getCurrentPosition(updateCoords);
	}

	var prometheus = {

		getData: function(dataType){
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
		},

		get: function(request){
			var response = {};
			if(Array.isArray(request) && request.length > 0){
				if(request.includes('all')){
					response = this.getData('all');
				}
				else{
					for(var d = 0; d < request.length; d++){
						var prop = request[d];
						response[prop] = this.getData(prop);
					}
				}
			}
			else if(request){
				response = this.getData(request);
			}
			else{
				response = "BAD_REQUEST_EXCEPTION"
			}
			return response;
		},

		createRoute: function(endpoint){
			var route;
			if(URL !== "NO_URL_EXCEPTION"){
				//TO-DO: check that endpoint has leading slash
				route = new Firebase(URL + endpoint);
			}
			else{
				throw new Error(URL, 'prometheus.js');
			}
			return route;
		},

		trackUser: function(uid){
			sessionStorage.setItem('prometheus_user', uid);
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
			var eventData = dataObj || "SAVED_VISIT";
			var meta = metaProps || 'all';
			var visitsRoute = this.createRoute('/users/' + uid + '/visits');
			var payload = {
				visit: this.get(meta),
				data: eventData
			}
			console.log('POST to: ' + URL + '/users/' + uid + '/visits')
			console.log(payload)
			//visitsRoute.push();
		},

		isTrackingUser: function(){
			var response = false;
			var trackedUID = sessionStorage.getItem('prometheus_user');
			if(trackedUID && trackedUID !== "NO_USER_TRACKING_EXCEPTION"){
				response = true;
			}
			return response;
		},

		print: function(){
			console.log('Bringing Firebase to humanity!');
			console.log(config);
		}

	}

	return prometheus;

}

return Prometheus;

}());

var prometheus = Prometheus({
	//TO-DO: write check to see if '/prometheus' is at the end of url
	url: 'https://prometheusjs.firebaseio.com/prometheus',
	locator: true
});