![Prometheus Long Logo](http://vingkan.github.io/prometheus/img/long-logo.png)

# Prometheus.js
Bringing Firebase-powered CRM and analytics to all of humanity.

+ Track user retention and engagement metrics.
+ Separate business logic from app logic.
+ Manage analytics from a customizable dashboard.

Prometheus.js ships with PandorasBox.js, a lean, user-specific split-testing tool for containing experimental features.

## Demo
This visitor filled out a contact form with an invalid email address. Normally, the website owner would not be able to get in touch with them. But, Prometheus lights the way by associating the form submission with the visiting user. Now the owner can find them!

![Prometheus Demo: Contact Form Mishap](http://vingkan.github.io/prometheus/img/demo.gif)

## Setup
Download [the latest version](http://vingkan.github.io/prometheus/prometheus.js) of Prometheus.js and include it in your HTML page. Prometheus.js depends on the Firebase JavaScript library.

```
<script src='https://cdn.firebase.com/js/client/2.2.1/firebase.js'></script>
<script src="prometheus.js"></script>
```
On each page that uses Prometheus.js, create a new instance of Prometheus.
```
var prometheus = Prometheus({
	url: 'https://APP_NAME.firebaseio.com/prometheus',
	locator: true
});
```
The configuration options are:
+ `url`: the URL of the Firebase datastore where data should be saved (must include the '/prometheus' at the end).
+ `locator`: boolean indicating whether or not to track geolocation data (defaults to false if not set).

## API
To integrate Prometheus.js into your website, these three functions are most important:

### prometheus.logon(uid, userData, metaProps)
Begins tracking a user. If user data (such as name, email, profile picture, etc.) are provided, it will update that information in Firebase. Appends a logon event to the list of that user's visits to the site in Firebase. Call this function as close to the login auth in your website as possible. When `.logon()` is called, Prometheus.js will continue to track that user until the browser session is cleared.
+ uid (string, optional): unique identifier of user to track.
+ userData (object, optional): user properties to save or update.
+ metaProps (array, optional): metadata to save with event, see *Metadata*

### prometheus.save(dataObj, metaProps)
For use when currently tracking a user. Appends a new event to the list of the user's visits in Firebase. As long as `.logon()` or `.trackUser()` has been called, `.save()` will associate the visit event with the current user's data in Firebase.
+ dataObj (object, optional): customizable information to record with event.
+ metaProps (array, optional): metadata to save with event, see *Metadata*

### prometheus.trackUser(uid)
For tracking a user without calling `.logon()`. When `.trackUser()` is called, Prometheus.js will continue to track that user until the browser session is cleared.
+ uid (string, optional): unique identifier of user to track.

### Notes
+ If no unique user identification is available, for whatever reason, Prometheus.js will save data at the Firebase endpoint `/ANONYMOUS_USER`.

More documentation coming soon...

## Metadata
Prometheus.js can retrieve four types of metadata about the user's visit to your site. When the argument `metaProps` is present, you can specify what metadata to save in Firebase with the visit by passing in an array of the following tags:
+ `'location'`: user's latitude and longitude coordinates, only if `locator` has been set to true in the configuration.
+ `'datetime'`: timestamp and timezone offset when the event is saved.
+ `'browser'`: the name and version of the browser being used.
+ `'page'`: the URL of the page the user is on.

Using the `'all'` tag will return save all four types of metadata. If no `metaProps` argument is given, this is the default functionality.

## Dashboard
Explore the data saved by Prometheus.js with a customizable, local dashboard! An analytics dashboard for Prometheus.js is coming soon...

## PandorasBox.js
Prometheus.js gives you the gift of better tracking the interactions of specific users with your website or app. These analytics can be a massive help when running A/B tests on your site. Of course, as in Greek myth, the great power brought by Prometheus can also cause great chaos.
PandorasBox.js works with Prometheus.js to help you contain experimental features in split testing. You can even designate specific users to target when deploying new features. Together, these two tools make following up with those beta users painless!
PandorasBox.js is coming soon...

## About Us
Prometheus.js and PandorasBox.js were created by the development team at [Omnipointment](https://www.omnipointment.com/): the omnipotent appointment scheduling tool.
