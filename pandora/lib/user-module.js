var UserListBox = React.createClass({
	mixins: [ReactFireMixin],
	render: function(){
		return (
			<div className="user-list-div">
				<div className="user-list-img" style={{
					backgroundImage: 'url(' + this.props.img + ')'
				}}></div>
				<div className="user-list-name">
					{this.props.name}
				</div>
				<div className="user-list-info">
					<i className="fa fa-icon fa-eye"></i>
					<span>
						{this.props.visits}
					</span>
					<i className="fa fa-icon fa-clock-o"></i>
					<span>
						{moment(this.props.lastTime).fromNow()}
					</span>
				</div>
			</div>
		);
	}
});


var UserModule = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function(){
		window.toggleLoading();
		return {
			users: [],
			fb_key: window.CONFIG.FIREBASE_KEY
		}
	},
	componentWillMount: function(){
		var fb_url = 'http://' + this.state.fb_key + '.firebaseio.com/prometheus/users';
		this.firebaseRef =  new Firebase(fb_url);
		var _this = this;
		this.firebaseRef.on('value', function(snapshot){
			var users = [];
			snapshot.forEach(function(childSnap){
				var user = childSnap.val();
				user.key = childSnap.key();
				var visitList = [];
				for(var i in user.visits){
					visitList.push(user.visits[i]);
				}
				user.visits = visitList;
				if(user.key !== 'ANONYMOUS_USER'){
				users.push({
					key: user.key,
					img: user.profile.img || user.profile.picture,
					name: user.profile.name,
					visits: user.visits.length,
					lastTime: user.visits[user.visits.length-1].meta.datetime.timestamp
				});
				}
			});
			_this.setState({
				users: users
			});
			window.toggleLoading();
		}).bind(this);
	},
	componentDidMount: function(){
		
	},
	componentWillUnmount: function(){
		this.firebaseRef.off();
	},
	render: function(){
		var userNodes = this.state.users.map(function(user){
			return (
				<UserListBox 
					name={user.name} 
					img={user.img}
					visits={user.visits}
					lastTime={user.lastTime}
					key={user.key}>
				</UserListBox>
			);

		});
		return (
			<div className="UserModule">
				{userNodes}
			</div>
		);
	}
});

ReactDOM.render(
	<UserModule />,
	document.getElementById('user-list')
);