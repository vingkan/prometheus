![Prometheus Long Logo](http://vingkan.github.io/prometheus/img/long-logo.png)

# Prometheus: Notifications
Send popups to specific users via web notifications. (Proposed Feature)

[![Stories in Ready](https://badge.waffle.io/vingkan/prometheus.png?label=ready&title=Ready)](https://waffle.io/vingkan/prometheus) [![Join the chat at https://gitter.im/vingkan/prometheus](https://badges.gitter.im/vingkan/prometheus.svg)](https://gitter.im/vingkan/prometheus?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Demo
This visitor was selected as a small group of users to get a sneak preview of new features! When she clicked on the notification from Prometheus, she saw the information the web developers wanted her to. The team received record that they reached her, helpful, because even though we think this is a good way to reach users, we can't guarantee that every user will engage with the notifications developers set for them.

![Prometheus Demo: Notifications to Custom Users](http://g.recordit.co/19KT68G0NX.gif)

## Usage
This feature is built on top of Prometheus' `.deliver()` method. Assign notification IDs and add users under them in the Pandora Dashboard to specify which users should receive the prepared notification.

### prometheus.notify(noteID, note, callback)
Send popups to specific users via web notifications.
+ noteID (string, required): id used to group receiving users and notification return information
+ note (object, required): 
	+ title (string, optional): notification title.
	+ message (string, optional): notification body.
	+ icon (string, optional): notication icon.
+ callback (function, optional): code to run if a user clicks on the notification body

## Example from Demo:
This block of code is responsible for the notification shown in the demo gif.

```javascript
prometheus.notify('features-note', {
	title: "New Features",
	message: "We're considering adding some new features. Click to reveal them.",
	icon: "http://i.imgur.com/mUIQRVy.jpg"
}, function(){
	var features = [
		"Send web notifications to specific users from the dashboard.",
		"Integrate with new Firebase 3.0 features."
	];
	var list = document.getElementById('feature-list');
	list.innerHTML = '';
	for(var i = 0; i < features.length; i++){
		list.innerHTML += '<li>' + features[i] + '</li>';
	}
});

```
If an icon is not specified in the note argument or the developer wishes to use one icon for all notifications, they can reference its URL with the icon variable in the Prometheus configuration. Individual icon URLs passed into the `.notify()` function have precedence over the config icon.
```javascript
var prometheus = Prometheus({
	apiKey: "...",
	...
	icon: "https://v.cdn.vine.co/r/avatars/453D86296A1289362655722774528_4dd5b70336c.5.0.jpg"
});
```
If neither icon is specified, the icon used will be the Prometheus logo. ;)

## Extensions
These are potential extensions of this feature that come to mind, not necessarily beneficial use cases.
+ Add a UI for sending notifications to Pandora Dashboard, potentially stocking up an 'inbox' of notifications for users (if there will be many notifications, will need a less annoying delivery method than web notifications).
+ Allow client to send data back through `.notify()` callback that gets recorded with the `NOTIFICATION_CLICKED` event saved by Prometheus.
+ Allow for other conditions or user information to trigger the notification even if the user is not assigned to the notification ID in the Dashboard.

## About Us
Prometheus.js and PandorasBox.js were created by the development team at [Omnipointment](https://www.omnipointment.com/): the omnipotent appointment scheduling tool.
