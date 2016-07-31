window.UserViewModule = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function(){
		window.toggleLoading(true);
		return {
			name: '',
			uid: this.props.uid,
			limit: 10
		}
	},
	componentWillMount: function(){
		var fb_url = 'prometheus/users/' + this.state.uid;
		var ref = firebase.database().ref(fb_url);
		var _this = this;
		ref.on('value', function(snapshot){
			var data = snapshot.val();
			var visitList = [];
			for(var i in data.visits){
				visitList.push(data.visits[i]);
			}
			var email = data.profile.email || 'not listed';
			_this.setState({
				name: data.profile.name,
				img: data.profile.img || data.profile.picture,
				email: email,
				visits: visitList
			});
			window.toggleLoading(false);
		}).bind(this);
	},
	loadMore: function(){
		this.setState(function(prev, curr){
			return {limit: prev.limit + 10};
		});
	},
	render: function(){
		var visits = _.clone(this.state.visits);
		visits.reverse();
		var visitList = visits.slice(0, this.state.limit);
		var visitNodes = visitList.map(function(visit, index){
			if(visit.visit.type === "TIMER"){
				var timer = visit.visit;
				var length = moment.duration(moment(timer.end).diff(timer.start));
				var duration = '';
				if(length.asMinutes() < 1){
					duration = length.asSeconds() + ' seconds';
				}
				else{
					duration = length.asMinutes() + ' minutes';
				}
				visit.visit.duration = duration;
			}
			return (
				<VisitView
					meta={visit.meta} 
					data={visit.visit} 
					key={index}>
				</VisitView>
			);
		});
		if(this.state.visits.length > this.state.limit){
			return (
				<div className="UserViewModule user-view">
					<h1>{this.state.name || 'No Name Listed'}</h1>
					<p>
						<i className="fa fa-icon fa-clock-o"></i>
						Last visited {moment(visits[visits.length-1].meta.datetime.timestamp).fromNow()}
					</p>
					<p>
						<i className="fa fa-icon fa-eye"></i>
						{visits.length} total visits
					</p>
					<p>
						<i className="fa fa-icon fa-envelope-o"></i>
						{this.state.email || 'no email listed'}
					</p>
					<p>
						<i className="fa fa-icon fa-code-fork"></i>
						UID: {this.state.uid}
					</p>
					<div className="user-view-img" style={{
						backgroundImage: 'url(' + (this.state.img || '"/style/img/faded-logo.png"') + ')'
					}}></div>
					<div className="visits-field">
						{visitNodes}
						<p>
							Showing {this.state.limit}/{this.state.visits.length}
						</p>
						<button class="load-more" onClick={this.loadMore}>
							Load More Visits
						</button>
					</div>
				</div>
			);
		}
		else{
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
					<p>
						<i className="fa fa-icon fa-envelope-o"></i>
						{this.state.email || 'no email listed'}
					</p>
					<p>
						<i className="fa fa-icon fa-code-fork"></i>
						UID: {this.state.uid}
					</p>
					<div className="user-view-img" style={{
						backgroundImage: 'url(' + this.state.img + ')'
					}}></div>
					<div className="visits-field">
						{visitNodes}
						<p>End of History</p>
					</div>
				</div>
			);
		}
	}
});

window.renderUserViewModule = function(uid){
	
	ReactDOM.unmountComponentAtNode(document.getElementById('user-info'));
	ReactDOM.render(
		<UserViewModule uid={uid} />,
		document.getElementById('user-info')
	);

}