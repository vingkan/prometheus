window.VisitView = React.createClass({
	mixins: [ReactFireMixin],
	handleImageData: function(name, data){
		if(name === 'img'){
			return (
				<img className="panel-view-screenshot" src={data}></img>
			);
		}
		else{
			return (
				<span>{data}</span>
			);
		}
	},
	displayProperty: function(name, data, icon, key){
		var imgData = this.handleImageData(name, data);
		if(name === 'Page'){
			return (
				<div className="prop-info" key={key}>
					<i className={'fa fa-icon fa-' + icon}></i>
					<span className="meta-prop-label">{name}:</span>
					<a href={data.url} target="_blank" key={key}>
						{data.title}
						<i className={'fa fa-icon fa-external-link'}></i>
					</a>
				</div>
			);
		}
		else{
			return (
				<div className="prop-info" key={key}>
					<i className={'fa fa-icon fa-' + icon}></i>
					<span className="meta-prop-label">{name}: </span>
					{imgData || data}
				</div>
			);
		}
	},
	render: function(){
		var _this = this;
		var propertyList = [];
		var endNode = null;
		for(var i in this.props.data){
			var prop = {
				name: i,
				data: this.props.data[i],
				icon: 'gear'
			};
			if(i === 'type'){
				prop.icon = 'database';
				propertyList.unshift(prop);
			}
			if(i === 'img'){
				endNode = prop;
			}
			else{
				propertyList.push(prop);
			}
		}
		var meta = this.props.meta;
		propertyList.push.apply(propertyList, [
			{name: 'Page', data: {title: meta.page.title || 'No Title', url: meta.page.url}, icon: 'file-text-o'},
			{name: 'URL', data: meta.page.url, icon: 'link'},
			{name: 'Device', data: meta.browser.device || 'Unknown', icon: 'tablet'},
			{name: 'Browser', data: meta.browser.name + ' ' +  meta.browser.version, icon: 'desktop'},
			{name: 'Width', data: (meta.browser.width || '?') + ' px', icon: 'arrows-h'},
			{name: 'Height', data: (meta.browser.height || '?') + ' px', icon: 'arrows-v'},
			{name: 'Date', data: moment(meta.datetime.timestamp).format('M/D/YYYY'), icon: 'calendar'},
			{name: 'Time', data: moment(meta.datetime.timestamp).format('h:mm A'), icon: 'clock-o'},
			{name: 'City', data: (meta.location.city || 'Unknown') + ', ' + meta.location.country, icon: 'globe'}
		]);
		if(endNode){
			propertyList.push(endNode);
			endNode.icon = 'camera';
		}
		var propertyNodes = propertyList.map(function(prop, index){
			return _this.displayProperty(prop.name, prop.data, prop.icon, index);
		});
		return (
			<div className={'user-visit-view ' + this.props.data.type.toLowerCase()}>
				<h4 className="visit-summary">
					{this.props.data.type + ': ' + moment(this.props.meta.datetime.timestamp).format('M/D/YY h:mm A')}
				</h4>
				<div className="visit-meta-fields">
					{propertyNodes}
				</div>
			</div>
		);
	}
});