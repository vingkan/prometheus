window.UserListBox = React.createClass({
	mixins: [ReactFireMixin],
	loadUserView: function(){
		renderUserViewModule(this.props.uid);
	},
	render: function(){
		var timeFormat = '';
		var lastVisit = moment(this.props.lastTime);
		var daySince = -1 * moment.duration(lastVisit.diff(Date.now())).asDays();
		if(daySince < 1){
			timeFormat = lastVisit.format('h:mm A');
		}
		else if(daySince < 7){
			timeFormat = lastVisit.format('dd h:mm A');
		}
		else{
			timeFormat = lastVisit.fromNow();
		}
		return (
			<div className="user-list-div" onClick={this.loadUserView}>
				<div className="user-list-img" style={{
					backgroundImage: 'url(' + (this.props.img || '"/style/img/faded-logo.png"') + ')'
				}}></div>
				<div className="user-list-name">
					{this.props.name || 'No Name Listed'}
				</div>
				<div className="user-list-info">
					<span>
						<i className="fa fa-icon fa-eye"></i> {this.props.visits}
					</span>
					<span>
						<i className="fa fa-icon fa-clock-o"></i> {timeFormat}
					</span>
				</div>
			</div>
		);
	}
});

window.UserModule = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function(){
		window.toggleLoading(true);
		return {
			users: []
		}
	},
	componentWillMount: function(){
		var fb_url = 'prometheus/users';
		var ref = firebase.database().ref(fb_url);
		var _this = this;
		ref.on('value', function(snapshot){
			var users = [];
			var userMap = snapshot.val();
			snapshot.forEach(function(childSnap){
				var user = childSnap.val();
				user.key = childSnap.key;
				var visitList = [];
				for(var i in user.visits){
					visitList.push(user.visits[i]);
				}
				user.visits = visitList;
				if(user.key !== 'ANONYMOUS_USER'){
					var userData = {
						key: user.key,
						img: user.profile.img || user.profile.picture,
						name: user.profile.name,
						email: user.profile.email || 'none listed',
						visits: user.visits.length,
						lastTime: user.visits[user.visits.length-1].meta.datetime.timestamp,
						visitList: visitList
					}
					users.push(userData);
				}
			});
			users.sort(function(a, b){
				function getLastVisit(d){
					return d.visitList[d.visitList.length-1];
				}
				return getLastVisit(b).meta.datetime.timestamp - getLastVisit(a).meta.datetime.timestamp;
			});
			_this.setState({
				users: users
			});
			window.toggleLoading(false);
		}).bind(this);
	},
	render: function(){
		var users = this.state.users;
		//var userList = users.slice(0, 5);
		var userNodes = users.map(function(user){
			return (
				<UserListBox 
					name={user.name} 
					img={user.img}
					visits={user.visits}
					lastTime={user.lastTime}
					uid={user.key}
					key={user.key}>
				</UserListBox>
			);

		});
		return (
			<div className="UserModule">
				{userNodes}
			</div>
		);
	},
	componentDidMount: function(){
		var users = this.state.users;
		if(users.length > 0){
			var last = users[users.length - 1];
			renderUserViewModule(last.key);
		}		
	}
});

window.renderUserModule = function(){

	ReactDOM.render(
		<UserModule />,
		document.getElementById('user-list')
	);

}