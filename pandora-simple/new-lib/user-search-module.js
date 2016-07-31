window.UserSearchModule = React.createClass({
	getInitialState: function(){
		window.toggleLoading(true);
		return {
			users: this.props.users,
			query: this.props.query,
			limit: 10
		}
	},
	componentWillMount: function(){
		window.toggleLoading(false);
	},
	loadMore: function(){
		this.setState(function(prev, curr){
			return {limit: prev.limit + 20};
		});
	},
	closeSearch: function(){
		var searchListDiv = document.getElementById('search-list');
		var userListDiv = document.getElementById('user-list');
		userListDiv.style.display = 'block';
		ReactDOM.unmountComponentAtNode(searchListDiv);
	},
	render: function(){
		var userList = this.state.users;
		var users = [];
		if(userList){
			users = userList.slice(0, this.state.limit);
			var userNodes = users.map(function(user){
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
			var loadMore;
			if(this.state.limit < this.state.users.length){
				loadMore = (
					<div>
					<p>Showing {this.state.limit}/{this.state.users.length} users.</p>
					<button class="load-more" onClick={this.loadMore}>Load More Users</button>
					</div>
				);
			}
			else{
				loadMore = (
					<p>Showing all {this.state.users.length} users.</p>
				);
			}
		}
		return (
			<div className="UserModule">
				<button onClick={this.closeSearch}>Clear Search Results</button>
				<h3>Results for {this.state.query}:</h3>
				{userNodes}
				{loadMore}
			</div>
		);
	},
	componentDidUpdate: function(){
		var users = this.state.users;
		if(users.length > 0){
			var last = users[0];
			renderUserViewModule(last.key);
		}		
	}
});

window.SearchInputBox = React.createClass({
	searchUsers: function(event){
		var query = event.target.value;
		search(query);
	},
	render: function(){
		return (
			<input type="text" placeholder="Search Users" onChange={this.searchUsers}></input>
		);
	}
});

window.renderSearchModule = function(){

	ReactDOM.render(
		<SearchInputBox />,
		document.getElementById('search-box')
	)

}


window.search = function(query){
	var results = userSearch.search(query);

	var searchListDiv = document.getElementById('search-list');
	var userListDiv = document.getElementById('user-list');

	ReactDOM.unmountComponentAtNode(searchListDiv);
	userListDiv.style.display = 'none';

	ReactDOM.render(
		<UserSearchModule users={results} query={query}/>,
		searchListDiv
	);

}