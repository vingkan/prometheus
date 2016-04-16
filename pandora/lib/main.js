var LIVE = true;

if(LIVE){
	var fb = new Firebase('http://prometheusjs.firebaseio.com/prometheus');

	fb.once('value', function(snapshot){
		var data = snapshot.val();
		main(data);
	});
}
else{
	main(FB_DATA.prometheus);
}

function UserListDiv(user){
	var img = user.profile.img || user.profile.picture;
	var last = user.visits[user.visits.length-1];
	var html = '<div class="user-list-div">';
		html += '<div class="user-list-img" style="background-image: url(&quot;' + img + '&quot;);"></div>';
		html += '<div class="user-list-name">' + user.profile.name + '</div>';
		html += '<div class="user-list-info"><i class="fa fa-icon fa-eye"></i> ' + user.visits.length + '</div>';
		html += '<div class="user-list-info"><i class="fa fa-icon fa-clock-o"></i> ' + moment(last.meta.datetime.timestamp).fromNow() + '</div>';
		html += '</div>';
	return html;
}

function main(data){
	var userList = document.getElementById('user-list');
	var max = 10;
	var n = 0;
	for(var i in data.users){
		if(n < max){
			var user = data.users[i];
			var visitList = [];
			for(var i in user.visits){
				visitList.push(user.visits[i]);
			}
			user.visits = visitList;
			userList.innerHTML += UserListDiv(user);
			n++;
		}
		else{
			break;
		}
	}
	console.log("DONE");
}