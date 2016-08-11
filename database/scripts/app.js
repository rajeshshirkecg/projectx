/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Shortcuts to DOM Elements.
var signInButtonGoogle = document.getElementById('sign-in-button-google');
var signInButtonFacebook = document.getElementById('sign-in-button-facebook');
var signInButtonAnonymously = document.getElementById('sign-in-button-anonymous');
var signInButtonWithPassword = document.getElementById('sign-in-button-password');


var signOutButton = document.getElementById('sign-out-button');

var splashPage = document.getElementById('page-splash');


// Bindings on load.
window.addEventListener('load', function () {


    signInButtonGoogle.addEventListener('click', function () {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider);
    });

    signInButtonAnonymously.addEventListener('click', function () {
        firebase.auth().signInAnonymously().catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(error.code);
            // [START_EXCLUDE]
            if (errorCode === 'auth/operation-not-allowed') {
                alert('You must enable Anonymous auth in the Firebase Console.');
            } else {
                console.error(error);
            }
            // [END_EXCLUDE]
        });
    });

    // Bind Sign out button.
    signOutButton.addEventListener('click', function () {
        firebase.auth().signOut();
    });

    firebase.auth().onAuthStateChanged(onAuthStateChanged);
}, false);


function onAuthStateChanged(user) {
    if (user) {
        splashPage.style.display = 'none';
        //splashPage.style.display = 'none'; 308
        if (user.isAnonymous) {
            writeUserData(user.uid, user.uid, "", "");
        }
        else {
            writeUserData(user.uid, user.displayName, user.email, user.photoURL);
        }
        //startDatabaseQueries();
    } else {
        // Display the splash page where you can sign-in.
        splashPage.style.display = '';
        //alert('a');
    }
}

// [START basic_write]
function writeUserData(userId, name, email, imageUrl) {
    firebase.database().ref('users/' + userId).set({
        username: name,
        email: email,
        profile_picture: imageUrl
    });
}

// [START googlecallback]
function onSignIn(googleUser) {
    var credential = firebase.auth.GoogleAuthProvider.credential(
        googleUser.getAuthResponse().id_token);

    firebase.auth().currentUser.link(credential).then(function (user) {
        console.log("Account linking success", user);
    }, function (error) {
        console.log("Account linking error", error);
    });
}
// [END googlecallback]

// [START facebookcallback]
function checkLoginState(event) {
    if (event.authResponse) {
        // User is signed-in Facebook.
        //var unsubscribe = firebase.auth().onAuthStateChanged(function (firebaseUser) {
        //    unsubscribe();
        //    // Check if we are already signed-in Firebase with the correct user.
        //    if (!isUserEqual(event.authResponse, firebaseUser)) {
        //        // Build Firebase credential with the Facebook auth token.
        //        // [START facebookcredential]
        //        var credential = firebase.auth.FacebookAuthProvider.credential(
        //            event.authResponse.accessToken);
        //        // [END facebookcredential]
        //        // Sign in with the credential from the Facebook user.
        //        // [START authwithcred]
        //        firebase.auth().signInWithCredential(credential).catch(function (error) {
        //            // Handle Errors here.
        //            var errorCode = error.code;
        //            var errorMessage = error.message;
        //            // The email of the user's account used.
        //            var email = error.email;
        //            // The firebase.auth.AuthCredential type that was used.
        //            var credential = error.credential;
        //            // [START_EXCLUDE]
        //            if (errorCode === 'auth/account-exists-with-different-credential') {
        //                alert('You have already signed up with a different auth provider for that email.');
        //                // If you are using multiple auth providers on your app you should handle linking
        //                // the user's accounts here.
        //            } else {
        //                console.error(error);
        //            }
        //            // [END_EXCLUDE]
        //        });
        //        // [END authwithcred]
        //    } else {
        //        // User is already signed-in Firebase with the correct user.
        //    }
        //});
    } else {
        // User is signed-out of Facebook.
        // [START signout]
        firebase.auth().signOut();
        // [END signout]
    }
}
// [END facebookcallback]

// [START checksameuser]
function isUserEqual(googleUser, firebaseUser) {
    if (firebaseUser) {
        var providerData = firebaseUser.providerData;
        for (var i = 0; i < providerData.length; i++) {
            if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                providerData[i].uid === googleUser.getBasicProfile().getId()) {
                // We don't need to reauth the Firebase connection.
                return true;
            }
        }
    }
    return false;
}
// [END checksameuser]