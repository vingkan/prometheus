if (!String.prototype.supplant) {
	String.prototype.supplant = function (o) {
		return this.replace(
			/\{([^{}]*)\}/g,
			function (a, b) {
				var r = o[b];
				return typeof r === 'string' || typeof r === 'number' ? r : a;
			}
		);
	};
}

/*var fb = new Firebase('http://omnipointment.firebaseio.com/prometheus');

fb.once('value', function(snapshot){
	var data = snapshot.val();
	main(data);
});*/

var userList = document.getElementById('user-list');

main(FB_DATA.prometheus);

function UserListDiv(user){
	console.log(user)
	var counter = {
		total: 0,
		login: 0,
		error: 0,
	};
	for(var i in user.visits){
		var visit = user.visits[i];
		if(visit.type === 'USER_LOGON'){
			counter.login++;
		}
		if(visit.type === 'ERROR'){
			counter.error++;
		}
		counter.total++;
	}
	var html = '<div class="user-list-div">';
	var img = user.profile.img || user.profile.picture;
	html += '<div class="user-list-img" style="background-image: url(&quot;' + img + '&quot;);"></div>';
	html += '<div class="user-list-name">{name}</div>'.supplant(user.profile);
	html += '<div class="user-list-info info-total">{total}</div>'.supplant(counter);
	html += '<div class="user-list-info info-login">{login}</div>'.supplant(counter);
	html += '<div class="user-list-info info-error">{error}</div>'.supplant(counter);
	html += '</div>';
	return html;
}

function main(data){
	var max = 10;
	var n = 0;
	for(var i in data.users){
		if(n < max){
			var user = data.users[i];
			userList.innerHTML += UserListDiv(user);
			n++;
		}
		else{
			break;
		}
	}
	console.log("DONE")
	console.log(userList)
}