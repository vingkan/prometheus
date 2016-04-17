var FeatureModule = React.createClass({
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
		var fb_url = 'http://' + this.state.fb_key + '.firebaseio.com/prometheus/features/';
		this.firebaseRef =  new Firebase(fb_url);
		var _this = this;
		this.firebaseRef.on('value', function(snapshot){
			var data = snapshot.val();
			var featureList = [];
			for(var i in data){
				var accessList = [];
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
	render: function(){
		var featureNodes = this.state.features.map(function(feature, index){
			return (
				<div className="feature-view" key={index}>
					<h3>{feature.info.name}</h3>
					<ul>{feature.access.map(function(allowed, aidx){
						return (
							<li key={aidx}>
								{allowed}
							</li>
						);
					})}</ul>
				</div>
			);
		});
		return (
			<div className="featureModule feature-module">
				{featureNodes}
			</div>
		);
	}
});

window.renderFeatureModule = function(){

	toggleSpace('features');

	ReactDOM.render(
		<FeatureModule />,
		document.getElementById('feature-list')
	);

}