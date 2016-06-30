![Prometheus Long Logo](http://vingkan.github.io/prometheus/img/long-logo.png)

# Prometheus.js
Bringing Firebase-powered CRM and analytics to all of humanity.

+ Track user-specific and event-based data.
+ Separate business logic from app logic.
+ Manage analytics from a customizable dashboard.

Prometheus ships with Pandora's Box, an analytics dashboard that can release experimental features and promotions to specific users.

[![Stories in Ready](https://badge.waffle.io/vingkan/prometheus.png?label=ready&title=Ready)](https://waffle.io/vingkan/prometheus) [![Join the chat at https://gitter.im/vingkan/prometheus](https://badges.gitter.im/vingkan/prometheus.svg)](https://gitter.im/vingkan/prometheus?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Demo
This visitor filled out a contact form with an invalid email address. Normally, the website owner would not be able to get in touch with them. But, Prometheus lights the way by associating the form submission with the visiting user. Now the owner can find them!

![Prometheus Demo: Contact Form Mishap](http://vingkan.github.io/prometheus/img/demo.gif)

# Setup
Download [the latest version](https://github.com/vingkan/prometheus/tree/master/dist) of Prometheus.js (or `npm install prometheusjs`) and include it in your project. Prometheus.js depends on the Firebase JavaScript library.

```
<script src="https://www.gstatic.com/firebasejs/live/3.0/firebase.js"></script>
<script src="prometheus.js"></script>
```
On each page that tracks data, create a new instance of Prometheus.
```
var prometheus = Prometheus({
  apiKey: "apiKey",
  authDomain: "projectId.firebaseapp.com",
  databaseURL: "https://databaseName.firebaseio.com"
});
```
You can auto-generate the config above by following the instructions on [Firebase's web setup page](https://firebase.google.com/docs/web/setup#project_setup). Additional configuration options are:
+ `locator` (boolean): whether or not to track geolocation data (defaults to true).
+ `noScreenshots` (boolean): whether or not to turn off screenshots (defaults to false).
+ `localhost` (boolean): whether or not to track events on localhost (defaults to true).

# API
+ Tracking
    + [logon(uid, userData, metaProps)](#logon)
    + [save(dataObj, metaProps)](#save)
    + [capture(dataObj)](#capture)
    + [error(errorObj)](#error)
    + [timer(timerID)](#timer)
    + [Timer Object](#timer-object)
+ [Metadata](#metadata)
    + browser
    + location
    + datetime
    + page
+ Delivery
    + [has(featureID)](#has)
    + [can(featureID, callback, fallback)](#can)
    + [deliver(featureID, callback, fallback)](#deliver)
    + [redeem(promoCode, callback, fallback, settings)](#redeem)
    + [notify(noteID, content, callback)](#notify)
    + [Note Object](#note-object)

## Logon
### prometheus.logon(uid, userData, metaProps)
Begins tracking a user. If user data (such as name, email, profile picture, etc.) are provided, it will update that information in Firebase. Call this function as close to the login auth in your website as possible. When `.logon()` is called, Prometheus.js will continue to track that user until the browser's `localStorage` is cleared.
+ `uid` (string): unique identifier of user to track.
    + Note: If no unique user identification is available, for whatever reason, Prometheus.js will save data at the Firebase endpoint `/ANONYMOUS_USER`.
+ `userData` (object, optional): user properties to save or update.
+ `metaProps` (array, optional): metadata to save with event, see [Metadata](#metadata)

Saves an event of type `'LOGON'` with the user's visit list.

## Save
### prometheus.save(dataObj, metaProps)
Appends a new event to the list of the user's visits in Firebase. As long as `.logon()` or `.trackUser()` has been called, `.save()` will associate the visit event with the current user's data in Firebase. This is the most versatile tracking method because it stores custom data passed into the `dataObj` argument. The other tracking methods are built on top of `save()` and also allow custom data to be passed in.
+ `dataObj` (object, optional): customizable information to record with event.
+ `metaProps` (array, optional): metadata to save with event, see [Metadata](#metadata)

Specify what type the saved event should be by setting `type` in the `dataObj` argument. Examples: `{type: "CONTACT_FORM_SUBMISSION"}` or `{type: "SETTINGS_PAGE"}`. Choose descriptive event type names that will help you analyze the data tracked by Prometheus effectively.

## Capture
### prometheus.capture(dataObj)
Takes a "snapshot" of the user's screen using the [html2canvas](https://html2canvas.hertzen.com/) library. For more information about what the screenshot represents, consult that libraries' documentation. Only saves images if `noScreenshots` is false in the config. Otherwise, the saved event will have a property `img_note` that has the value `"NONE_TAKEN"`.
+ `dataObj` (object, optional): customizable information to record with event.

Saves an event of type `'SCREEN_CAPTURE'` with the user's visit list with a property `img` whose value is the screenshot data.

## Error
### prometheus.error(errorObj)
Records errors experienced by the user. Triggered automatically by `window.onerror` events, but can also be called explicitly.
+ `errorObj` (object): data about error, should include:
    + `message` (string): message accompanying error
    + `url` (string): URL of file where the error occurred
    + `line` (integer): line number where error occurred

Saves an event of type `'ERROR'` with the user's visit list.

## Timer
### prometheus.timer(timerID)
Retrieves timer object of the given id.
+ `timerID` (string): id of timer/action being timed

See Timer object methods below.

## Timer Object
### prometheus.Timer
Timer objects track how long users take to complete certain actions. Each action, behavior, or section of your website/app that will be tracked should have a unique, well-named ID. Prometheus can track timer durations by referencing that ID with its `timer()` method. The timer returned by that method has two public methods:

#### Methods
+ `start(data)`: starts timing target action, accepts preliminary data
+ `stop(data)`: stops timing target action, accepts additional data, new data with the same property name as the preliminary data will override the preliminary data

If `stop()` is called on a timer, an event of the type `"TIMER"` will be saved in the user's events list. It will include the following data:
+ `start` (timestamp): unix timestamp of start time
+ `end` (timestamp): unix timestamp of end time
+ `timerID` (string): ID of timer and target action
+ Any additional data saved via the `start()` and `stop()` arguments

## Metadata
Prometheus.js can retrieve four types of metadata about the user's visit to your site. When the argument `metaProps` is present, you can specify what metadata to save in Firebase with the visit by passing in an array of tags. Underneath each tag in the bulleted list below is the metadata returned for that category.
+ `'browser'`
    +  `device`: type of device (desktop, tablet, mobile, or unknown)
    +  `height`: height of screen (pixels)
    +  `width`: width of screen (pixels)
    +  `name`: browser name
    +  `version`: browser version
+ `'location'`
    + Note: if `locator` is false in the config, this will contain "NO_GEOLOCATION_EXCEPTION"
    + `city`: approximate city from geoip data
    + `country`: country from geoip data
    + `latitude`: approximate latitude coordinates
    + `longitude`: approximate longitude coordinates
    + `ip`: device IP address
+ `'datetime'`
    + `timestamp`: Unix timestamp for instant of event
    + `timezoneOffset`: offset for user's timezone
+ `'page'`
    +  `title`: title of page/document
    +  `url`: URL of page/document

Using the `'all'` tag instead of a list of tags will return save all four types of metadata. If no `metaProps` argument is given, this is the default functionality.

## Has
### prometheus.has(featureID)
Synchronously checks if user has access to the given feature.
+ `featureID` (string): id of feature to check for
+ `@returns` (boolean): whether or not user has access to the feature

## Can
### prometheus.can(featureID, callback, fallback)
Asynchronously checks if user has access to the given feature and runs the appropriate function. The `can()` method should be used when no changes need to be made to user data, i.e., only a `validate` (explained below) function is called from Firebase.
+ `featureID` (string): id of feature stored at `prometheus/features/{featureID}`. Must have a `validate` function.
+ `callback` (function, required): function to run if user does have access to feature. Receives any data passed back from the validation as an argument.
+ `fallback` (function, recommended): function to run if user does not have access to feature. Receives any data passed back from the validation as an argument.

#### Validate Function
The `.can()` method runs a function stored in your Firebase to validate feature acccess. Thus, each feature entry must have a `validate` function that checks if the user can access the given feature, based on their data properties. The function definition can also choose what user data, if any, to pass back to the client.

Sample `validate` function for a video calling feature check:
```javascript
if(userData.videoCalls){
    return {
        allowed: true,
        data: {
            lastCall: userData.lastVideoCallTimestamp
        }
    };
}
else{
    return {
        allowed: false
    };
}
```
This screenshot shows where to store the `validate` function in Firebase.
![Sample Feature Validation Entry in Firebase](https://raw.githubusercontent.com/vingkan/prometheus/master/img/sample-feature-entry.PNG)

## Deliver
### prometheus.deliver(featureID, callback, fallback)
Asynchronously checks if user has access to the given feature and runs the appropriate function. The `deliver()` method should be used when changes need to be made to user data, i.e., a `process` (explained below) function is called from Firebase.
+ `featureID` (string): id of feature stored at `prometheus/features/{featureID}`. Should have a `process` function.
+ `callback` (function, required): function to run if user does have access to feature. Receives any data passed back from the processing as an argument.
+ `fallback` (function, recommended): function to run if user does not have access to feature. Receives any data passed back from the processing as an argument.

#### Process Function
The `.deliver()` method runs a function stored in your Firebase to process feature acccess. Thus, each feature entry may have a `process` function that edits the user's data according to the given feature. The function definition can also choose what user data, if any, to pass back to the client.

Sample `process` function for a create meeting feature delivery request:
```javascript
// TO-DO: Check if user has `createCredits` data property
if (userData.createCredits > 0) {
	userData.createCredits--;
	return {
		allowed: true,
		changed: true,
		data: {
		    createCredits: userData.createCredits
		}
	};
} else {
	return {
		allowed: false,
		data: {
		    createCredits: userData.createCredits
		}
	};
}
```
See the screenshot from the [`.can()` section](#can) to see where to store the `process` function in Firebase. It must be saved with the key `process`.

## Redeem
### prometheus.redeem(promoCode, callback, fallback, settings)
Looks up a given promo code and runs the promo code's redeem function on the user's feature data.
+ `promoCode` (string, required): promo code stored at `prometheus/promos/{promoCode}`. Must have a `redeem` function.
+ `callback` (function, recommended): function to run if code is redeemed. Callback receives the information stored with the code in Firebase as its only argument, if any.
+ `fallback` (function, recommended): function to run if code is not found or is unredeemable. Fallback receives error type and error message.
+ `settings` (object, optional): extra settings for redeeming promo codes, currently only one setting:
    + `silent` (boolean, optional): whether or not to record when users attempt to re-use codes (defaults to false)

#### Redeem Function
Each promo code entry must have a `redeem` function that updates the users' data according to the promotion. Here is a sample `redeem` function for a create meeting credit promo code:
```javascript
userData.createCredits += 5;
return userData;
```
This screenshot shows where to store the `redeem` function in Firebase.
![Sample Promo Code Entry in Firebase](https://raw.githubusercontent.com/vingkan/prometheus/master/img/sample-promo-entry.PNG)

## Notify
### prometheus.notify(noteID, note, callback)
Sends popups to specific users via web notifications.
+ `noteID` (string, required): id used to group receiving users and notification return information, stored at `prometheus/features/{noteID}`. Must have a validate function to determine if user should recieve notification.
+ `note` (object, required): 
	+ `title` (string, optional): notification title.
	+ `message` (string, optional): notification body.
	+ `icon` (string, optional): notication icon.
+ `callback` (function, optional): code to run if a user clicks on the notification body

See Note object methods below.

## Note Object
### prometheus.Note
Callback functions for `notify()` include a Note object that has two methods for the developer to access. Keep in mind that the notifications functionality is built on top of `deliver()`, so each notification should be defined at `prometheus/features/{noteID}` and have at least a `validate` function.
#### Methods
+ `seen():` saves a Prometheus `"NOTIFICATION_CLICKED"` event for the user
+ `terminate():` removes the notification ID from the user's data: they will not receive this notification unless it is reassigned to them

## Pandora's Box Dashboard
Explore the data saved by Prometheus.js with a customizable, local dashboard! Instructions to use the analytics dashboard with your Prometheus-tracked data are [here](https://github.com/vingkan/prometheus/blob/master/pandora/README.md).

## About Us
Prometheus.js and PandorasBox.js were created by the development team at [Omnipointment](https://www.omnipointment.com/): the omnipotent appointment scheduling tool.
