window.userSearch = new JsSearch.Search('key');
userSearch.addIndex('name');

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
			users: [],
			limit: 10
		}
	},
	componentWillMount: function(){

		var stateContainer = this;
		var userList = [];
		var visitsRef = firebase.database().ref('prometheus/visits');
		visitsRef.on('value', function(visitsSnap){

			var vs = visitsSnap.val();
			var nodes = 0;
			var counter = 0;
			for(var c in vs){
				if(c !== 'ANONYMOUS_USER' && vs[c]){
					nodes++;
				}
			}
			
			visitsSnap.forEach(function(childSnap){
				var visitsData = childSnap.val();
				var uid = childSnap.key;
				var visitList = [];
				for(var v in visitsData){
					visitList.push(visitsData[v]);
				}
				visitList.sort(function(a, b){
					return b.meta.datetime.timestamp - a.meta.datetime.timestamp;
				});
				var userRef = firebase.database().ref('prometheus/users/' + uid);
				userRef.on('value', function(userSnap){
					var user = userSnap.val();
					if(uid !== 'ANONYMOUS_USER' && user.profile){
						var userData = {
							key: uid,
							img: user.profile.img || user.profile.picture,
							name: user.profile.name,
							email: user.profile.email || 'none listed',
							visits: visitList.length,
							lastTime: visitList[0].meta.datetime.timestamp,
							firstTime: visitList[visitList.length-1].meta.datetime.timestamp,
							visitList: visitList
						}
						userList.push(userData);
						counter++;
						if(counter === nodes){
							var users = userList.sort(function(a, b){
								return b.lastTime - a.lastTime;
							});
							stateContainer.setState({
								users: users
							});
							userSearch.addDocuments(users);
							userList = [];
							window.toggleLoading(false);
						}
					}
				}).bind(this);
			});

		}).bind(stateContainer);

	},
	loadMore: function(){
		this.setState(function(prev, curr){
			return {limit: prev.limit + 20};
		});
	},
	render: function(){
		var userList = this.state.users;
		var users = [];
		if(userList){
			users = userList.slice(0, this.state.limit);
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
			var loadMore;
			if(this.state.limit < this.state.users.length){
				loadMore = (
					<div>
					<p>Showing {this.state.limit}/{this.state.users.length} users.</p>
					<button class="load-more" onClick={this.loadMore}>Load More Users</button>
					</div>
				);
			}
			else{
				loadMore = (
					<p>Showing all {this.state.users.length} users.</p>
				);
			}
		}
		return (
			<div className="UserModule">
				<h3>Users</h3>
				{userNodes}
				{loadMore}
			</div>
		);
	},
	componentDidUpdate: function(){
		var users = this.state.users;
		if(users.length > 0){
			var last = users[0];
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