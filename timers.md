![Prometheus Long Logo](http://vingkan.github.io/prometheus/img/long-logo.png)

# Prometheus: Timers
Track how long users take to complete specific actions on your site. (New Feature)

[![Stories in Ready](https://badge.waffle.io/vingkan/prometheus.png?label=ready&title=Ready)](https://waffle.io/vingkan/prometheus) [![Join the chat at https://gitter.im/vingkan/prometheus](https://badges.gitter.im/vingkan/prometheus.svg)](https://gitter.im/vingkan/prometheus?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Demo
The Prometheus team wanted to know how long users spend writing their contact messages as well as if there was any wait time between arriving on the page and starting to write. Multiple timers allow tracking of both. This is the kind of information the dashboard displays:

![Prometheus Dashboard: Sample Timer Entry](https://raw.githubusercontent.com/vingkan/prometheus/master/img/timer.PNG)

## Usage
Calling `prometheus.timer(timerID)` returns the `Timer` object that corresponds to that id/activity.

### prometheus.timer(timerID)
Track the duration of specific activities.
+ timerID (string, required): id used to time a specific activity
+ Returns: Timer
	+ start (function, data): starts timing the activity
		+ data (obj, optional): additional data about the event
	+ stop (function, data): finishes timing and saves event
		+ data (obj, optional): additional data about the event
		+ Note: data passed to `.stop()` will override data passed to `.start()` if they have the same key

## Example from Demo:
This block of code is responsible for recording timers shown in the demo.

```javascript
prometheus.timer('contact_form_total').start();

var emailInput = document.getElementById('email');
emailInput.addEventListener('focus', function(){
	// You can run multiple timers on the same page
	prometheus.timer('contact_form_writing').start({trigger: 'email input'});
	// Timer.start() can be called with additional data about the event
});
var messageInput = document.getElementById('message');
messageInput.addEventListener('focus', function(){
	// You can have multiple start points for the same timer, any repeated start() calls will not override the original start time
	prometheus.timer('contact_form_writing').start({trigger: 'message input'});
});

function submitMessage(email, message){
	// ... Message is submitted here
	prometheus.timer('contact_form_total').stop();
	// Timer.stop() can be called with additional data about the event
	prometheus.timer('contact_form_writing').stop({length: message.
	// Currently, each timer should only be stopped in one place, but stopping multiple different timers together is fine
}

$('#contact-button').click(function(){
	// ... Message is handled here
	submitMessage(email, message);
});

```

## About Us
Prometheus.js and PandorasBox.js were created by the development team at [Omnipointment](https://www.omnipointment.com/): the omnipotent appointment scheduling tool.
