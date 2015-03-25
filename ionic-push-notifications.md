# A brief overview
Often times when you're building a mobile app you will want to alert users that they should open your app. Whether it's a like on their photo or a reminder that today is their anniversary (for the record, this example is definitely not from my own personal experience), push notifications serve an important purpose in the lifecycle of mobile applications. However, if you've done any research on push notifications, you know that the nuts and bolts of how push notifications work under the hood are not particularly straightforward. The good news is that there are some awesome plugins and services that make sending push notifications absolutely painless and we'll be covering them thoroughly in this course.

## How push notifications work
Lets first get a basic understanding of how Apple's APNS and Google's GCM push notification architectures work. It's important to know what happens under the hood even though we'll be using services that abstract away this complexity for us.

{video: push-overview}

The video above explains the high level overview of how this all works, but if you're interested learning more, the following resources from Google and Apple should answer any of the remaining questions you have:

{x: apple-push-info} [Apple Push Notification Service](https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/ApplePushService.html#//apple_ref/doc/uid/TP40008194-CH100-SW9)
{x: google-push-info} [Google Cloud Messaging](https://developer.android.com/google/gcm/gcm.html)

Needless to say, these are not the most intuitive services to directly work with, and we highly recommend you use the amazing services that have been built to make them easier to implement. Without further ado, lets dive into the real meat of implementing push notifications in your apps.

# Implementing push notifications in your app
A couple of years ago, services began emerging that brought the simplicity of typical [pub/sub](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) systems to push notifications. Instead of having to manually track your user's phone IDs individually, these services allow you to simply subscribe your users to desired channels to receive push notifications from.

For example, if a user wants to be notified when a course on Javascript is published on Thinkster, we could subscribe them to a channel called "javascript" that thousands of other users could also be subscribed to. However, to trigger a push notification to all of these users would only take one line of code - simply publish a push notification to the "javascript" channel and all of our users will receive it. Compare this to querying your database that contains your user's phone IDs, segmenting which users want to be notified about Javascript, and then sending out notifications individually for each of them to APNS/GCM. Yuck!

There are a few services out there that provide this pub/sub functionality, but at this point in time, we highly recommend using Parse for managing your push notifications. Here's why:
- It's widely adopted and battle hardened from usage across 100,000+ apps
- It's free to send an unlimited number of push notifications as long as you have < 1 million users (!!!) registered on your app (after that you have to pay a measly five cents per thousand additional users)
- Their plugins and API are insanely easy to use
 
We will do an overview of a couple other services available to you later on in this course, but in general the setup across these various services are very similar!

## Preparing your environment
{x: ios-certificate} __If you plan on building an app for iOS__, you will need to create a certificate that allows your app to receive push notifications. [Read this guide through section 2 to learn how this is done.](https://www.parse.com/tutorials/ios-push-notifications)

The other thing you need to know when developing for iOS is that __Apple does not let you send push notifications to apps running in the emulator; you have to use a real device__. We recommend that you test any functions the push notification will invoke in the emulator, and then when your app is built out you will need to load your app on a real device to ensure push notifications are actually being received.


## Setting up Parse
{video: parse}

{x: signup-parse} The first thing you will need to do is sign up for a Parse account. You can do this by [visiting Parse's website](https://www.parse.com/apps) and creating an app (feel free to name it whatever you want).

{x: clone-repo} [Clone the repo for this course](https://github.com/EricSimons/ionic-push-notifications-course) and navigate to the `code/` directory. Run `npm install` to ensure all of Ionic's dependencies are installed.

To get this project working for your app specifically, we need to swap your unique keys and identifiers:

{x: setup-repo} In `config.xml`, make sure `widget id="your.app.here"` equals the identifier in your provisioning profile for APNS and/or for GCM.

{x: setup-parse} In `www/app.js`, in the line `window.parsePlugin.initialize(appId, clientKey`, replace `appId` and `clientKey` with your Parse app's application ID and client key (this can be found on your Parse app's settings page under 'keys')

{x: add-ios-android} Finally, add iOS and/or Android to this cordova project with `ionic platform add [ios | android]`

{x: install-parse-plugin} Install the Parse cordova by running `cordova plugin add https://github.com/benjie/phonegap-parse-plugin` (if you're developing for iOS, there is currently a fork with a newer Parse SDK you can install from here: https://github.com/fastrde/phonegap-parse-plugin)

At this point, your project should be runnable! There are really only two things you need to call when using Parse: `initialize`, which ensures that this device is registered for push notifications, and `subscribe`, which will subscribe this specific phone to any channel you provide. There is also a third method `getInstallationId` that will return the installation ID of this Parse user, but it's only useful if you're deep diving into some of Parse's more advanced features.

Lets take a quick moment to review the code connecting our app to Parse in `www/app.js`:

```javascript
window.parsePlugin.initialize(appId, clientKey, function() {
      console.log('Parse initialized successfully.');


      window.parsePlugin.subscribe('SampleChannel', function() {
        console.log('Successfully subscribed to SampleChannel.');


          window.parsePlugin.getInstallationId(function(id) {
            // update the view to show that we have the install ID
            console.log('Retrieved install id: ' + id);

              /**
               * Now you can construct an object and save it to your own services, or Parse, and corrilate users to parse installations
               * 
               var install_data = {
                  installation_id: id,
                  channels: ['SampleChannel']
               }
               *
               */

          }, function(e) {
            console.log('Failure to retrieve install id.');
          });

      }, function(e) {
          console.log('Failed trying to subscribe to SampleChannel.');
      });

    }, function(e) {
        console.log('Failure to initialize Parse.');
    });
```

This isn't terribly complex to look at, but do note that it's being run __after__ all of the Cordova apps have been loaded in `$ionicPlatform.ready`. This is important, as we don't want to call `window.parse` methods if the Parse plugin isn't available to us yet! Another thing to note is that this code will be fired every single time the app is opened. You can call `initialize` and `subscribe` to the same channel as many times as you want without it affecting the user, your Parse account, or APNS/GCM. In fact, it's probably best that you do this to ensure that the user didn't accidentally turn off push notifications for your app since the last time they used it.

Since this app is now subscribed to the 'SampleChannel' Parse channel, that means we can now send push notifications to it. As seen in the video above, you can do this through the Parse Push dashboard by specifying 'SampleChannel' as the target. However, if you're building a production ready application, you'll probably want to sending push notifications programmatically from your server via [Parse's REST API](https://www.parse.com/docs/push_guide#sending/REST).

Sending push notifications through channels is not only great for groups of users, but you can also use if for individual users as well. For example, you can programmatically create unique channels for every single one of your users by just subscribing them to a channel with their user ID appended to the end of it (i.e. `window.parsePlugin.subscribe('thinkster-user-' + userID)`). Even if your users sign in on new devices, you can continue sending them push notifications just by knowing their user ID!


# Other options
It is worth mentioning that a [new service from Ionic](https://apps.ionic.io/landing/push) is coming out of beta soon for push notifications that sounds totally awesome. Once this is released to the public, I will be updating this course accordingly!

## Roll your own
If you want to integrate with the raw APIs for APNS and GCM, I highly recommend checking out Holly Schinsky's posts on [Push notifications with ngCordova and Ionic](http://devgirl.org/2014/12/16/push-notifications-sample-app-with-ionic-and-ngcordova/), [push notifications with Cordova on Android](http://devgirl.org/2012/10/25/tutorial-android-push-notifications-with-phonegap/), and [push notifications with Cordova on iOS](http://devgirl.org/2012/10/19/tutorial-apple-push-notifications-with-phonegap-part-1/). Consider following her [on Twitter](https://twitter.com/devgirlFL) too, as she posts lots of great stuff for hybrid app developers!

# Final thoughts
If you're interested in staying in the loop on updates to this course and hybrid apps in general, [follow me on Twitter](https://twitter.com/ericsimons40)! If you find anything that should be fixed or have any suggestions, don't hesitate to reach out on Twitter or via email at eric@thinkster.io!