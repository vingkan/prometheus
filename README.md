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
+ Metadata
    + browser
    + location
    + datetime
    + page
+ Delivery
    + has(featureID)
    + can(featureID, callback, fallback)
    + deliver(featureID, callback, fallback)
    + redeem(promoCode, callback, fallback)
    + notify(noteID, content, callback)
    + Note Object

## Logon
### prometheus.logon(uid, userData, metaProps)
Begins tracking a user. If user data (such as name, email, profile picture, etc.) are provided, it will update that information in Firebase. Call this function as close to the login auth in your website as possible. When `.logon()` is called, Prometheus.js will continue to track that user until the browser's `localStorage` is cleared.
+ uid (string): unique identifier of user to track.
    + Note: If no unique user identification is available, for whatever reason, Prometheus.js will save data at the Firebase endpoint `/ANONYMOUS_USER`.
+ userData (object, optional): user properties to save or update.
+ metaProps (array, optional): metadata to save with event, see *Metadata*

Saves an event of type `'LOGON'` with the user's visit list.

## Save
### prometheus.save(dataObj, metaProps)
Appends a new event to the list of the user's visits in Firebase. As long as `.logon()` or `.trackUser()` has been called, `.save()` will associate the visit event with the current user's data in Firebase. This is the most versatile tracking method because it stores custom data passed into the `dataObj` argument. The other tracking methods are built on top of `save()` and also allow custom data to be passed in.
+ dataObj (object, optional): customizable information to record with event.
+ metaProps (array, optional): metadata to save with event, see *Metadata*

Specify what type the saved event should be by setting `type` in the `dataObj` argument. Examples: `{type: "CONTACT_FORM_SUBMISSION"}` or `{type: "SETTINGS_PAGE"}`. Choose descriptive event type names that will help you analyze the data tracked by Prometheus effectively.

## Capture
### prometheus.capture(dataObj)
Takes a "snapshot" of the user's screen using the [html2canvas](https://html2canvas.hertzen.com/) library. For more information about what the screenshot represents, consult that libraries' documentation. Only saves images if `noScreenshots` is false in the config. Otherwise, the saved event will have a property `img_note` that has the value `"NONE_TAKEN"`.
+ dataObj (object, optional): customizable information to record with event.

Saves an event of type `'SCREEN_CAPTURE'` with the user's visit list with a property `img` whose value is the screenshot data.

## Error
### prometheus.error(errorObj)
Records errors experienced by the user. Triggered automatically by `window.onerror` events, but can also be called explicitly.
+ errorObj (object): data about error, should include:
    + message (string): message accompanying error
    + url (string): URL of file where the error occurred
    + line (integer): line number where error occurred

Saves an event of type `'ERROR'` with the user's visit list.

## Timer
### prometheus.timer(timerID)
Retrieves timer object of the given id.
+ timerID (string): id of timer/action being timed

See Timer object methods below.

## Timer Object
### Object: prometheus.Timer
Timer objects track how long users take to complete certain actions. Each action, behavior, or section of your website/app that will be tracked should have a unique, well-named ID. Prometheus can track timer durations by referencing that ID with its `timer()` method. The timer returned by that method has two public methods:
#### Methods
+ start(data): starts timing target action, accepts preliminary data
+ stop(data): stops timing target action, accepts additional data, new data with the same property name as the preliminary data will override the preliminary data

If `stop()` is called on a timer, an event of the type `"TIMER"` will be saved in the user's events list. It will include the following data:
+ start (timestamp): unix timestamp of start time
+ end (timestamp): unix timestamp of end time
+ timerID (string): ID of timer and target action
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

## Pandora's Box Dashboard
Explore the data saved by Prometheus.js with a customizable, local dashboard! Instructions to use the analytics dashboard with your Prometheus-tracked data are [here](https://github.com/vingkan/prometheus/blob/master/pandora/README.md).

## About Us
Prometheus.js and PandorasBox.js were created by the development team at [Omnipointment](https://www.omnipointment.com/): the omnipotent appointment scheduling tool.
