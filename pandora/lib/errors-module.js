window.ErrorModule = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function(){
		return {
			fb_key: window.CONFIG.FIREBASE_KEY,
			errors: []
		}
	},
	componentWillMount: function(){
		var fb_url = 'http://' + window.CONFIG.FIREBASE_KEY + '.firebaseio.com/prometheus/users/';
		var ref =  new Firebase(fb_url);
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
						}
					}
				}
			}
			_this.setState({
				errors: errorList
			});
		}).bind(this);
	},
	componentDidMount: function(){
		
	},
	componentWillUnmount: function(){
		this.firebaseRef.off();
	},
	render: function(){
		var errorNodes = this.state.errors.map(function(errorItem, index){
			user = errorItem.user;
			return (
				<div className="module" key={index}>
					<UserListBox 
						name={user.name} 
						img={user.img}
						uid={user.uid}>
					</UserListBox>
					<p>
						{errorItem.visit.message}
					</p>
				</div>
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

	toggleSpace('errors');

	ReactDOM.render(
		<ErrorModule />,
		document.getElementById('errors')
	);

}