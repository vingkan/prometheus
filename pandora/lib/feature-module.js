window.PersonBox = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function(){
		return {
			fb_key: window.CONFIG.FIREBASE_KEY,
			uid: this.props.uid,
			data: {
				key: null,
				img: null,
				name: null,
				visits: 0,
				lastTime: null,
				visitList: []
			}
		}
	},
	componentWillMount: function(){
		var fb_url = 'prometheus/users/' + this.state.uid + '/';
		this.firebaseRef = firebase.database().ref(fb_url);
		var _this = this;
		this.firebaseRef.on('value', function(snapshot){
			var user = snapshot.val();
			user.key = snapshot.key();
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
					visits: user.visits.length,
					lastTime: user.visits[user.visits.length-1].meta.datetime.timestamp,
					visitList: visitList
				}
				_this.setState({
					data: userData
				});
			}
		}).bind(this);
	},
	render: function(){
		return (
			<div className="user-list-div" onClick={this.giveFeatureAccess}>
				<div className="user-list-img" style={{
					backgroundImage: 'url(' + this.state.data.img + ')'
				}}></div>
				<div className="user-list-name">
					{this.state.data.name}
				</div>
				<div className="user-list-info">
					<i className="fa fa-icon fa-eye"></i>
					<span>
						{this.state.data.visits}
					</span>
					<i className="fa fa-icon fa-clock-o"></i>
					<span>
						{moment(this.state.data.lastTime).fromNow()}
					</span>
				</div>
			</div>
		);
	}
});

window.deliverFeatureAccess = function(fid, uid){
	var fb_url = 'prometheus/features/' + fid + '/access/';
	var ref = firebase.database().ref(fb_url);
	ref.push(uid);
}

window.UserFeatureAddBox = React.createClass({
	mixins: [ReactFireMixin],
	giveFeatureAccess: function(){
		deliverFeatureAccess(this.props.feature_key, this.props.uid);
	},
	render: function(){
		return (
			<div className="user-list-div" onClick={this.giveFeatureAccess}>
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

window.StaticUserSearch = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function(){
		window.toggleLoading(true);
		return {
			users: [],
			fb_key: window.CONFIG.FIREBASE_KEY,
			bank: null,
			map: null
		}
	},
	componentWillMount: function(){
		var fb_url = 'prometheus/users';
		this.firebaseRef =  firebase.database().ref(fb_url);
		var _this = this;
		var bank = lunr(function(){
			this.field('name', {boost: 10});
			this.ref('id');
		});
		this.firebaseRef.on('value', function(snapshot){
			var users = [];
			var userMap = snapshot.val();
			snapshot.forEach(function(childSnap){
				var user = childSnap.val();
				user.key = childSnap.key();
				var visitList = [];
				for(var i in user.visits){
					visitList.push(user.visits[i]);
				}
				user.visits = visitList;
				if(user.key !== 'ANONYMOUS_USER'){
					var userData = {
						key: user.key,
						uid: user.key,
						img: user.profile.img || user.profile.picture,
						name: user.profile.name,
						visits: user.visits.length,
						lastTime: user.visits[user.visits.length-1].meta.datetime.timestamp,
						visitList: visitList
					}
					users.push(userData)
					bank.add({
						id: user.key,
						name: user.profile.name
					});
				}
			});
			users.sort(function(a, b){
				function getLastVisit(d){
					return d.visitList[d.visitList.length-1];
				}
				return getLastVisit(a).meta.datetime.timestamp < getLastVisit(b).meta.datetime.timestamp;
				return 0;
			});
			_this.setState({
				users: users,
				bank: bank,
				map: userMap
			});
			window.toggleLoading(false);
		}).bind(this);
	},
	componentDidMount: function(){
		
	},
	componentWillUnmount: function(){
		this.firebaseRef.off();
	},
	searchUser: function(e){
		var _this = this;
		var query = e.target.value;
		var results = this.state.bank.search(query);
		var resultList = []
		if(results.length > 0){
			for(var i = 0; i < results.length; i++){
				var rk = results[i].ref
				var user = this.state.map[rk]
				var visitList = [];
				for(var i in user.visits){
					visitList.push(user.visits[i]);
				}
				user.visits = visitList;
				resultList.push({
					key: rk,
					uid: rk,
					img: user.profile.img || user.profile.picture,
					name: user.profile.name,
					visits: user.visits.length,
					lastTime: user.visits[user.visits.length-1].meta.datetime.timestamp,
					visitList: visitList
				})
			}
		}
		else{
			resultList = this.state.users;
		}
		_this.setState({
			users: resultList
		});
	},
	render: function(){
		var _this = this;
		var resultNodes = this.state.users.map(function(user, index){
			var cisco = _this.props.feature_key;
			return (
				<UserFeatureAddBox 
					name={user.name} 
					img={user.img}
					visits={user.visits}
					lastTime={user.lastTime}
					feature_key={cisco}
					uid={user.uid}
					key={user.key}>
				</UserFeatureAddBox>
			);
		})
		return (
			<label className="search-wrapper">
				<input type="checkbox"></input>
				<div className="static-search-box">
					<input className="search-box" onChange={this.searchUser}></input>
					{resultNodes}
				</div>
			</label>
		);
	}
});

window.FeatureModule = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function(){
		window.toggleLoading(true);
		return {
			name: '',
			fb_key: window.CONFIG.FIREBASE_KEY,
			features: []
		}
	},
	componentWillMount: function(){
		var fb_url = 'prometheus/features/';
		this.firebaseRef =  firebase.database().ref(fb_url);
		var _this = this;
		this.firebaseRef.on('value', function(snapshot){
			var data = snapshot.val();
			var featureList = [];
			for(var i in data){
				var accessList = [];
				data[i].fid = i;
				for(var j in data[i].access){
					var accessKey = data[i].access[j];
					accessList.push(accessKey);
				}
				data[i].access = accessList;
				featureList.push(data[i]);
			}
			_this.setState({
				features: featureList
			});
			window.toggleLoading(false);
		}).bind(this);
	},
	componentDidMount: function(){
		
	},
	componentWillUnmount: function(){
		this.firebaseRef.off();
	},
	updateName: function(e){
		this.state.name = e.target.value;
	},
	updateFID: function(e){
		this.state.fid = e.target.value;
	},
	addFeature: function(e){
		var fb_url = 'prometheus/features/' + this.state.fid;
		var ref = firebase.database().ref(fb_url);
		ref.set({
			info: {
				name: this.state.name
			}
		});
		this.state.name = null;
		this.state.fid = null;
	},
	render: function(){
		var featureNodes = this.state.features.map(function(feature, index){
			return (
				<div className="module" key={index}>
					<div className="feature-view">
						<h1>{feature.info.name}</h1>
						<p>Feature ID: {feature.fid}</p>
						<h4>Enable Feature for More Users:</h4>
						<StaticUserSearch 
							feature_key={feature.fid}>
						</StaticUserSearch>
						<h4>Users with Feature Enabled:</h4>
						{feature.access.map(function(allowed, aidx){
							return (
								<PersonBox
									uid={allowed}
									key={aidx}>
								</PersonBox>
							);
						})}
					</div>
				</div>
			);
		});
		return (
			<div className="featureModule feature-module">
				<div className="module">
					<p>Create a new feature to track and deliver with Prometheus by setting a name and ID.</p>
					<input type="text" onChange={this.updateName} placeholder="Feature Name"></input>
					<input type="text" onChange={this.updateFID} placeholder="feature-id"></input>
					<button onClick={this.addFeature}>Add New Feature</button>
				</div>
				{featureNodes}
			</div>
		);
	}
});

window.renderFeatureModule = function(){

	ReactDOM.render(
		<FeatureModule />,
		document.getElementById('feature-list')
	);

}

renderFeatureModule();