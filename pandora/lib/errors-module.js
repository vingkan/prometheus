window.lastError = Date.now();

window.ErrorModule = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function(){
		return {
			fb_key: window.CONFIG.FIREBASE_KEY,
			errors: []
		}
	},
	componentWillMount: function(){
		var fb_url = 'prometheus/users/';
		var ref = firebase.database().ref(fb_url);
		var _this = this;
		ref.on('value', function(snapshot){
			var errorList = [];
			var userList = snapshot.val();
			for(var u in userList){
				var user = userList[u];
				var visits = user.visits;
				if(visits){
					for(var v in visits){
						if(visits[v] && visits[v].visit.type === 'ERROR'){
							var visit = visits[v];
							visit.user = user.profile;
							errorList.push(visit);
							if(visit.meta.datetime.timestamp > window.lastError){
								notify({
									message: user.profile.name + " experienced an error!",
									body: visit.visit.message,
									icon: user.profile.img,
									clickFn: function(){
										renderErrorModule();
									}
								});
								window.lastError = visit.meta.datetime.timestamp;
							}
						}
					}
				}
			}
			_this.setState({
				errors: errorList
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
		var sortedErrors = this.state.errors.sort(function(a, b){
			var diff = b.meta.datetime.timestamp - a.meta.datetime.timestamp;
			return diff;
		});
		var errorNodes = sortedErrors.map(function(errorItem, index){
			user = errorItem.user;
			try{
				errorItem.visit.user = user.name;
			}
			catch(e){
				console.warn(user);
			}
			return (
				<VisitView
					meta={errorItem.meta} 
					data={errorItem.visit}
					key={index}>
				</VisitView>
			);		
		});
		return (
			<div>
				{errorNodes}
			</div>
		);
	}
});

window.renderErrorModule = function(){

	window.toggleLoading(true);

	ReactDOM.render(
		<ErrorModule />,
		document.getElementById('error-list')
	);

}

renderErrorModule();