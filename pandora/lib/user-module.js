var VisitView = React.createClass({
	mixins: [ReactFireMixin],
	displayProperty: function(name, data, icon, key){
		return (
			<div className="prop-info" key={key}>
				<i className={'fa fa-icon fa-' + icon}></i>
				<span className="meta-prop-label">{name}: </span>
				<span>{data || 'N/A'}</span>
			</div>
		);
	},
	render: function(){
		var _this = this;
		var propertyList = [];
		for(var i in this.props.data){
			var prop = {
				name: i,
				data: this.props.data[i],
				icon: 'gear'
			};
			if(i === 'type'){
				propertyList.unshift(prop);
			}
			else{
				propertyList.push(prop);
			}

		}
		var meta = this.props.meta;
		propertyList.push.apply(propertyList, [
			{name: 'URL', data: meta.page.url, icon: 'file-text-o'},
			{name: 'Browser', data: meta.browser.name + ' ' +  meta.browser.version, icon: 'desktop'},
			{name: 'Date', data: moment(meta.datetime.timestamp).format('M/D/YYYY'), icon: 'calendar'},
			{name: 'Time', data: moment(meta.datetime.timestamp).format('h:mm A'), icon: 'clock-o'},
			{name: 'City', data: meta.location.city + ', ' + meta.location.country, icon: 'globe'}
		]);
		var propertyNodes = propertyList.map(function(prop, index){
			return _this.displayProperty(prop.name, prop.data, prop.icon, index);
		});
		return (
			<div className={'user-visit-view ' + this.props.data.type.toLowerCase()}>
				<div className="visit-summary">
					{this.props.data.type + ': ' + moment(this.props.meta.datetime.timestamp).format('M/D/YY h:mm A')}
				</div>
				<div className="visit-meta-fields">
					{propertyNodes}
				</div>
			</div>
		);
	}
});

var UserViewModule = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function(){
		window.toggleLoading(true);
		return {
			name: '',
			fb_key: window.CONFIG.FIREBASE_KEY,
			uid: this.props.uid
		}
	},
	componentWillMount: function(){
		var fb_url = 'http://' + this.state.fb_key + '.firebaseio.com/prometheus/users/' + this.state.uid;
		this.firebaseRef =  new Firebase(fb_url);
		var _this = this;
		this.firebaseRef.on('value', function(snapshot){
			var data = snapshot.val();
			var visitList = [];
			for(var i in data.visits){
				visitList.push(data.visits[i]);
			}
			_this.setState({
				name: data.profile.name,
				img: data.profile.img || data.profile.picture,
				email: data.profile.email || "Not accessible.",
				visits: visitList
			});
			window.toggleLoading(false);
		}).bind(this);
	},
	componentDidMount: function(){
		
	},
	componentWillUnmount: function(){
		this.firebaseRef.off();
	},
	render: function(){
		var visits = this.state.visits;
		var visitNodes = this.state.visits.map(function(visit, index){
			return (
				<VisitView
					meta={visit.meta} 
					data={visit.visit} 
					key={index}>
				</VisitView>
			);
		}).reverse();
		return (
			<div className="UserViewModule user-view">
				<h1>{this.state.name}</h1>
				<p>
					<i className="fa fa-icon fa-clock-o"></i>
					Last visited {moment(visits[visits.length-1].meta.datetime.timestamp).fromNow()}
				</p>
				<p>
					<i className="fa fa-icon fa-eye"></i>
					{visits.length} total visits
				</p>
				<div className="user-view-img" style={{
					backgroundImage: 'url(' + this.state.img + ')'
				}}></div>
				<div className="visits-field">
					{visitNodes}
				</div>
			</div>
		);
	}
});

window.renderUserViewModule = function(uid){
	
	ReactDOM.unmountComponentAtNode(document.getElementById('user-info'));
	ReactDOM.render(
		<UserViewModule uid={uid} />,
		document.getElementById('user-info')
	);

}

var UserListBox = React.createClass({
	mixins: [ReactFireMixin],
	loadUserView: function(){
		renderUserViewModule(this.props.uid);
	},
	render: function(){
		return (
			<div className="user-list-div" onClick={this.loadUserView}>
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
		window.toggleLoading(true);
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
						lastTime: user.visits[user.visits.length-1].meta.datetime.timestamp,
						visitList: visitList
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
				users: users
			});
			window.toggleLoading(false);
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
	}
});

window.renderUserModule = function(){

	toggleSpace('users');

	ReactDOM.render(
		<UserModule />,
		document.getElementById('user-list')
	);

}

renderUserModule();

window.renderMilestoneModule = function(){

	toggleSpace('milestones');

	/*ReactDOM.render(
		<UserModule />,
		document.getElementById('user-list')
	);*/

}
