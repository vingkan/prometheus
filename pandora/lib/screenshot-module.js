window.ScreenshotModule = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function(){
		window.toggleLoading(true);
		return {
			fb_key: window.CONFIG.FIREBASE_KEY,
			pics: []
		}
	},
	componentWillMount: function(){
		var fb_url = 'http://' + this.state.fb_key + '.firebaseio.com/prometheus/users/';
		this.firebaseRef =  new Firebase(fb_url);
		var _this = this;
		this.firebaseRef.on('value', function(snapshot){
			var data = snapshot.val();
			var imgList = [];
			for(var i in data){
				if(i !== 'ANONYMOUS_USER'){
					var user = data[i];
					for(var v in user.visits){
						var visit = user.visits[v];
						if(visit.visit.type === 'SCREEN_CAPTURE'){
							visit.visit.uid = i;
							imgList.push(visit.visit);
						}
					}
				}
			}
			_this.setState({
				pics: imgList
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
		var imgNodes = this.state.pics.map(function(pic, index){
			return (
				<div key={index}>
					<p>Caption: {pic.caption || 'No caption.'}</p>
					<PersonBox 
						uid={pic.uid}>
					</PersonBox>
					<div className="module">
						<img src={pic.img}></img>
					</div>
				</div>
			);
		});
		return (
			<div className="screenshot-module">
				{imgNodes}
			</div>
		);
	}
});

window.renderScreenshotModule = function(){

	toggleSpace('screenshots');

	ReactDOM.render(
		<ScreenshotModule />,
		document.getElementById('screenshot-list')
	);

}