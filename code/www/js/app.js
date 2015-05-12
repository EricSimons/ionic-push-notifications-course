angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    // Initialize push notifications!

    // first, lets initialize parse. fill in your parse appId and clientKey
    window.parsePlugin.initialize(appId, clientKey, function() {
      console.log('Parse initialized successfully.');


      window.parsePlugin.subscribe('SampleChannel', function() {
        console.log('Successfully subscribed to SampleChannel.');


          window.parsePlugin.getInstallationId(function(id) {
            // update the view to show that we have the install ID
            console.log('Retrieved install id: ' + id);

              /**
               * Now you can construct an object and save it to your own services, or Parse, and correlate users to parse installations
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



  });
});
