![Prometheus Long Logo](http://vingkan.github.io/prometheus/img/long-logo.png)

# Prometheus: Remote Configuration
_This is a pre-release._

Customize your users' experiences by

[![Stories in Ready](https://badge.waffle.io/vingkan/prometheus.png?label=ready&title=Ready)](https://waffle.io/vingkan/prometheus) [![Join the chat at https://gitter.im/vingkan/prometheus](https://badges.gitter.im/vingkan/prometheus.svg)](https://gitter.im/vingkan/prometheus?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Usage
Prometheus' `deliver()` method has been rebuilt to allow for more complex feature validation. This pre-release does not include dashboard updates that allow for manipulation of features, but it does bring a new `redeem()` function that allows users to receive access to features the webmaster has defined in the project Firebase.

### prometheus.deliver(featureID, callback, fallback)
Checks if a user has access to the given feature and runs the appropriate asychronous function.
+ featureID (string, required): ID of feature to look up.
+ callback (function, required): function to run if user does have access to feature. No arguments.
+ fallback (function, recommended): function to run if user does not have access to feature. No arguments.
#### Validate Function
Each feature entry must have a `validate` function that checks if the user can access the given feature, based on their data properties. The function definition can also choose what user data, if any, to pass back to the client.
Sample `validate` function for a create meeting feature delivery request, store this in Firebase with feature data:
```javascript
// TO-DO: Check if user has `createCredits` data property
if (userData.createCredits > 0) {
	userData.createCredits--;
	return {
		allowed: true,
		changed: true,
		data: {
		    createCredits: createCredits
		}
	};
} else {
	return {
		allowed: false,
		data: {
		    createCredits: createCredits
		}
	};
}
```
Where to store in Firebase:

![Sample Feature Validation Entry in Firebase](https://raw.githubusercontent.com/vingkan/prometheus/master/img/sample-feature-entry.PNG)

### prometheus.redeem(code, callback, fallback)
Looks up a given promo code and runs the promo code's redeem function on the user's feature data.
+ code (string, required): promo code stored at `prometheus/promos/{code}`. Must have a redeem function.
+ callback (function, recommended): function to run if code is redeemed. Callback receives the information stored with the code in Firebase as its only argument, if any.
+ fallback (function, recommended): function to run if code is not found or is unredeemable. Fallback receives error type and error message.

#### Redeem Function
Each promo code entry must have a `redeem` function that updates the users' data according to the promotion.
Sample `redeem` function for a create meeting credit promo code, store this in Firebase with promo data:
```javascript
userData.createCredits += 5;
return userData;
```
Where to store in Firebase:

![Sample Promo Code Entry in Firebase](https://raw.githubusercontent.com/vingkan/prometheus/master/img/sample-promo-entry.PNG)

## Migrating Features Data
Run this script in the console of your app to migrate existing features data from the `prometheus/features` branch to each user's `data` branch. The script will generate validation functions for those features but leave behind the list of allowed user IDs to allow the Dashboard to continue displaying access.
```javascript
var db = firebase.database().ref('prometheus/features');
db.once('value', function(snapshot){
    var val = snapshot.val()
    for(var feature in val){
        if(val[feature]){
            var users = val[feature].access;
            for(var i in users){
                console.log(feature, users[i]);
                var uid = users[i];
                var path = 'prometheus/users/' + uid + '/data/' + feature;
                var ref = firebase.database().ref(path);
                ref.set(true);
            }
            var validatePath = 'prometheus/features/' + feature + '/validate/';
            var featureRef =     firebase.database().ref(validatePath);
            var validateFn = "if(userData.hasOwnProperty('" + feature + "')){if(userData['" + feature + "']){return {allowed: true, changed: false}}else{return {allowed: false}}}else{return {allowed: false}}";
            featureRef.set(validateFn);
        }
    }
});
```
## About Us
Prometheus.js and PandorasBox.js were created by the development team at [Omnipointment](https://www.omnipointment.com/): the omnipotent appointment scheduling tool.
