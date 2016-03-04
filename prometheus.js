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

window.Prometheus = (function(){

var Prometheus = function(config){

	var URL = config.url || "NO_URL_EXCEPTION";

	var prometheus = {

		print: function(){
			console.log('Bringing Firebase to humanity!');
			console.log(config);
		}



	}

	return prometheus;

}

return Prometheus;

}());