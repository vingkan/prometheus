window.FeatureModule = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function(){
		window.toggleLoading(true);
		return {
			feature: {},
			list: []
		}
	},
	componentWillMount: function(){
		var fb_url = 'prometheus/features/';
		this.firebaseRef =  firebase.database().ref(fb_url);
		var _this = this;
		this.firebaseRef.on('value', function(snapshot){
			var data = snapshot.val();
			var list = [];
			for(var i in data){
				if(data[i]){
					list.push({
						id: i,
						info: data[i].info,
						validate: data[i].validate,
						process: data[i].process
					});
				}
			}
			var single = list[0];
			console.log(single)
			_this.setState({
				feature: single,
				list: list
			});
			window.toggleLoading(false);
		}).bind(this);
	},
	componentDidMount: function(){
		
	},
	componentWillUnmount: function(){
		this.firebaseRef.off();
	},
	changeFeature: function(e){
		this.setState({
			id: e.target.value
		});
	},
	render: function(){
		console.log(this.state.feature)
		return (
			<div className="featureModule feature-remote-module">
				<select onChange={this.changeFeature}>
					{this.state.list.map(function(feat, index){
						return (
							<option
								key={index}
								value={feat.id}>
								{feat.info.name || feat.id}
							</option>
						);
					})}
				</select>
				<FeaturePane
					fid={this.state.feature.id}
					name={this.state.feature.info.name}>
				</FeaturePane>
			</div>
		);
	}
});

window.FeaturePane = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function(){
		console.log(this)
		window.toggleLoading(true);
		return {
			name: '',
			fid: ''
		}
	},
	componentWillMount: function(){
		this.setState({
			name: this.props.name
		});
	},
	componentDidMount: function(){
		
	},
	componentWillUnmount: function(){
		this.ref.off();
	},
	render: function(){
		console.log(this.state)
		return (
			<div className="featurePane">
				<h2>{this.state.name}</h2>
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