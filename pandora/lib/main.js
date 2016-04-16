var LIVE = false;

if(LIVE){
	loadFromFirebase('prometheusjs');
}
else{
	main(FB_DATA.prometheus);
}

$('#dashboard-key').blur(function(){
	loadFromFirebase(this.innerText.toLowerCase());
});

function loadFromFirebase(key){
	toggleLoading();
	var fb = new Firebase('http://' + key + '.firebaseio.com/prometheus');
	fb.once('value', function(snapshot){
		var data = snapshot.val();
		main(data);
		toggleLoading();
	});
}

function toggleLoading(){
	if(document.body.classList.contains('loading')){
		document.body.classList.remove('loading');
	}
	else{
		document.body.classList.add('loading');
	}
}

function main(data){
	var userList = document.getElementById('user-list');
		userList.innerHTML = '';
	var max = 10;
	var n = 0;
	for(var i in data.users){
		if(n < max){
			var user = data.users[i];
			var visitList = [];
			for(var i in user.visits){
				visitList.push(user.visits[i]);
			}
			user.visits = visitList;
			user.id = i;
			n++;
		}
		else{
			break;
		}
	}
	console.log("DONE");
}

var UserListBox = React.createClass({
	mixins: [ReactFireMixin],
	render: function(){
		return (
			<div className="user-list-div">
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
})


  /*componentWillMount: function() {
    this.firebaseRef = new Firebase('https://ReactFireTodoApp.firebaseio.com/items/');
    this.firebaseRef.limitToLast(25).on('value', function(dataSnapshot) {
      var items = [];
      dataSnapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item['.key'] = childSnapshot.key();
        items.push(item);
      }.bind(this));

      this.setState({
        items: items
      });
    }.bind(this));
  },*/


var UserModule = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function(){
		console.log('INIT STATE')
		return {
			users: [],
			fb_key: 'prometheusjs'
		}
	},
	componentWillMount: function(){
		var fb_url = 'http://' + this.state.fb_key + '.firebaseio.com/prometheus/users';
		console.log(fb_url)
		this.firebaseRef =  new Firebase(fb_url);
		var _this = this;
		this.firebaseRef.on('value', function(snapshot){
			console.log(this)
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
					lastTime: user.visits[user.visits.length-1].meta.datetime.timestamp
				});
				}
			})
			_this.setState({
				users: users
			})
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

ReactDOM.render(
	<UserModule />,
	document.getElementById('user-list')
);


var TodoList2 = React.createClass({
  render: function() {
    var _this = this;
    var createItem = function(item, index) {
      return (
        <li key={ index }>
          { item.text }
          <span onClick={ _this.props.removeItem.bind(null, item['.key']) }
                style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
            X
          </span>
        </li>
      );
    };
    return <ul>{ this.props.items.map(createItem) }</ul>;
  }
});

var TodoApp2 = React.createClass({
  getInitialState: function() {
    return {
      items: [],
      text: ''
    };
  },

  componentWillMount: function() {
    this.firebaseRef = new Firebase('https://ReactFireTodoApp.firebaseio.com/items/');
    this.firebaseRef.limitToLast(25).on('value', function(dataSnapshot) {
      var items = [];
      dataSnapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item['.key'] = childSnapshot.key();
        items.push(item);
      }.bind(this));

      this.setState({
        items: items
      });
    }.bind(this));
  },

  componentWillUnmount: function() {
    this.firebaseRef.off();
  },

  onChange: function(e) {
    this.setState({text: e.target.value});
  },

  removeItem: function(key) {
    var firebaseRef = new Firebase('https://ReactFireTodoApp.firebaseio.com/items/');
    firebaseRef.child(key).remove();
  },

  handleSubmit: function(e) {
    e.preventDefault();
    if (this.state.text && this.state.text.trim().length !== 0) {
      this.firebaseRef.push({
        text: this.state.text
      });
      this.setState({
        text: ''
      });
    }
  },

  render: function() {
    return (
      <div>
        <TodoList2 items={ this.state.items } removeItem={ this.removeItem } />
        <form onSubmit={ this.handleSubmit }>
          <input onChange={ this.onChange } value={ this.state.text } />
          <button>{ 'Add #' + (this.state.items.length + 1) }</button>
        </form>
      </div>
    );
  }
});

ReactDOM.render(<TodoApp2 />, document.getElementById('content'));