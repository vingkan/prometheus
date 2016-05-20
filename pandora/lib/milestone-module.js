window.MilestoneModule = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function(){
		return {
			fb_key: window.CONFIG.FIREBASE_KEY,
			visits: {},
			users: []
		}
	},
	componentWillMount: function(){

		function getMonthRef(date){
			var r = new Date(date.getUTCFullYear(), date.getUTCMonth()-1).getTime() + '';
			return r;
		}

		var fb_url = 'prometheus/users/';
		var ref = firebase.database().ref(fb_url);
		var _this = this;
		ref.on('value', function(snapshot){
			var userMap = snapshot.val();
			var userList = [];
			var visitTree = {}
			for(var t = 0; t < 12; t++){
				visitTree[getMonthRef(new Date(2016, t%12))] = {
					visits: [],
					acquisition: [],
					retention: []
				}
			}
			for(var i in userMap){
				if(i !== 'ANONYMOUS_USER'){
					var user = userMap[i];
					user.first = 100000000000000;
					user.last = 0;
					for(var v in user.visits){
						var visit = user.visits[v];
						visit.uid = i;
						var timestamp = visit.meta.datetime.timestamp;
						if(timestamp < user.first){
							user.first = timestamp
						}
						if(timestamp > user.last){
							user.last = timestamp;
						}
						try{
							var insert = visitTree[getMonthRef(new Date(timestamp))].visits;
							insert.push(visit);
						}
						catch(e){
							visitTree[getMonthRef(new Date(timestamp))].visits = [visit];
						}
					}
					try{
						var insertFirst = visitTree[getMonthRef(new Date(user.first))].acquisition;
						insertFirst.push(user)
					}
					catch(e){
						visitTree[getMonthRef(new Date(user.first))].acquisition = [user];
					}
					try{
						var insertLast = visitTree[getMonthRef(new Date(user.last))].retention;
						insertLast.push(user)
					}
					catch(e){
						visitTree[getMonthRef(new Date(user.last))].retention = [user];
					}
					userList.push(user);
				}
			}
			_this.setState({
				visits: visitTree,
				users: userList
			});
		}).bind(this);
	},
	componentDidMount: function(){
		
	},
	componentWillUnmount: function(){
		this.firebaseRef.off();
	},
	render: function(){
		var monthData = []
		for(var monthRef in this.state.visits){
			var visits = this.state.visits[monthRef].visits;
			var acquisition = this.state.visits[monthRef].acquisition;
			var retention = this.state.visits[monthRef].retention;
			monthData.push({
				timestamp: parseInt(monthRef, 10),
				visits: visits,
				acquisition: acquisition,
				retention: retention
			});
		}
		var monthNodes = monthData.map(function(month, index){
			if(month.visits.length > 0){
				return (
					<div className="month-milestone" key={index}>
						<h2>{moment(month.timestamp).format('MMMM YYYY')}</h2>
						<div className="module">
							<p>{month.visits.length} total visits.</p>
							<h3>{month.acquisition.length} visited for the first time.</h3>
							{month.acquisition.map(function(aq, idx){
								return (
									<img className="milestone-head" src={aq.profile.img || aq.profile.picture} key={idx}></img>
								);
							})}
							<h3>{month.retention.length} haven&#39;t visited since.</h3>
							{month.retention.map(function(rt, idx){
								return (
									<img className="milestone-head" src={rt.profile.img || rt.profile.picture} key={idx}></img>
								);
							})}
						</div>
					</div>
				);
			}
		});
		function getLoyalty(user){
			var a = moment(user.first);
			var b = moment(user.last);
			var loyalty = b.diff(a, 'days');
			return loyalty;
		}
		var sortedUsers = this.state.users.sort(function(a, b){
			return getLoyalty(b) - getLoyalty(a);
		});
		var userNodes = sortedUsers.map(function(user, idx){
			return (
				<li key={idx}>
					{user.profile.name} stayed on for {getLoyalty(user)} days.
				</li>
			);
		});
		return (
			<div className="milestones-module">
				<h1>Milestones</h1>
				{monthNodes}
				<h1>Loyalty Leaderboard</h1>
				<div className="module">
					<ol>{userNodes}</ol>
				</div>
			</div>
		);
	}
});

window.renderMilestoneModule = function(){

	ReactDOM.render(
		<MilestoneModule />,
		document.getElementById('milestone-list')
	);

}

renderMilestoneModule();