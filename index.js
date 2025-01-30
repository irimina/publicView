import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";

/* === Imports Firestore === */
import { getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js"

import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
/* 
=== Firebase Setup === */

const firebaseConfig = {
    apiKey: "AIzaSyDmvcbn_ik_49Fn_hntoVG2reAwLrMr20s",
    authDomain: "moody-a68e0.firebaseapp.com",
    projectId: "moody-a68e0",
    storageBucket: "moody-a68e0.firebasestorage.app",
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app)

const provider = new GoogleAuthProvider();

const db = getFirestore(app);

/* === UI === */

/* == UI - Elements == */

const viewLoggedOut = document.getElementById("logged-out-view")
const viewLoggedIn = document.getElementById("logged-in-view")

const signInWithGoogleButtonEl = document.getElementById("sign-in-with-google-btn")

const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")

const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")

const signOutButtonEl = document.getElementById("sign-out-btn")

const userProfilePictureEl = document.getElementById("user-profile-picture")

const userGreetingEl = document.getElementById("user-greeting")

const textareaEl = document.getElementById("post-input")

const postButtonEl = document.getElementById("post-btn")

const postsEl = document.getElementById("posts")

/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)
signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)

signOutButtonEl.addEventListener("click", authSignOut)

postButtonEl.addEventListener("click", postButtonPressed)

/* === Main Code === */

onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedInView()
    showProfilePicture(userProfilePictureEl, user)
    showUserGreeting(userGreetingEl, user)
    fetchInRealtimeAndRenderPostsFromDB()

  } else {
    showLoggedOutView()
    fetchInRealtimeAndRenderPostsFromDB()
  }
});

/* === Functions === */

function authSignInWithGoogle() {
    signInWithPopup(auth, provider)
  .then((result) => {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    const user = result.user;
  }).catch((error) => {

    console.error(error.message)
  });

}

function authSignInWithEmail() {
    console.log("Sign in with email and password")
   const email= emailInputEl.value
   const password = passwordInputEl.value

signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    clearAuthFields()
  })
  .catch((error) => {
    console.error(error.message)
  });

}

function authCreateAccountWithEmail() {
    console.log("Sign up with email and password")
    const email = emailInputEl.value
    const password= passwordInputEl.value

  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    clearAuthFields() 
  })
  .catch((error) => {
    console.error(error.message)
  });

}

function authSignOut() {
      signOut(auth).then(() => {
      }).catch((error) => {
        console.error(error.message)
      });

}

/* = Functions - Firebase - Cloud Firestore = */


async function addPostToDB(postBody, user) {
        try {
          const docRef = await addDoc(collection(db, "posts"), {
            body:postBody,
            uid: user.uid,
            createdAt:serverTimestamp()
          });
          console.log("Document written with ID: ", docRef.id);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
}

function fetchInRealtimeAndRenderPostsFromDB() {
    onSnapshot(collection(db, "posts"), (querySnapshot) => {
            clearAll(postsEl) 
            querySnapshot.forEach((doc)=>{
               console.log(doc.data())
    })
})
}
/* == Functions - UI Functions == */

function renderPost(postsEl, postData) {
      postsEl.innerHTML += `
              <div class="post">
            <div class="header">
                <h3>${displayDate(postData.createdAt)}</h3>
            </div>
          <p>
                ${postData.body}
            </p>
        </div>
      `
}

function postButtonPressed() {
    const postBody = textareaEl.value
    const user = auth.currentUser
    if (postBody) {
        addPostToDB(postBody, user)
        clearInputField(textareaEl)
    }
}

function clearAll(element) {
  element.innerHTML = ""
}

function showLoggedOutView() {
    hideView(viewLoggedIn)
    showView(viewLoggedOut)
}

function showLoggedInView() {
    hideView(viewLoggedOut)
    showView(viewLoggedIn)
}

function showView(view) {
  view.style.display = "flex"
}

function hideView(view) {
  view.style.display = "none"
}


function clearInputField(field) {
	field.value = ""
}

function clearAuthFields() {
	clearInputField(emailInputEl)
	clearInputField(passwordInputEl)
}

// for the user profile challenge

function showProfilePicture(imgElement, user) {
        const photoURL = "https://unsplash.it/1920/1080?random"
        if (photoURL) {
            imgElement.src = photoURL
        } else {
            imgElement.src = "assets/images/defaultPic.jpg"
        }
}

function showUserGreeting(element, user) {
        const displayName = "Mr.Irimina"
        if (displayName) {
            const userFirstName = displayName.split(" ")[0]
            element.textContent = `Hi ${userFirstName}`
        } else {
            element.textContent = `Hey friend, how are you?`
        }
    }
        

  function displayDate(firebaseDate) {
    if (!firebaseDate) {
        return "Date processing. Slight delay for realtime update"
    }
    const date = firebaseDate.toDate()
    const day = date.getDate()
    const year = date.getFullYear()
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = monthNames[date.getMonth()]

    let hours = date.getHours()
    let minutes = date.getMinutes()
    hours = hours < 10 ? "0" + hours : hours
    minutes = minutes < 10 ? "0" + minutes : minutes

    return `${day} ${month} ${year} - ${hours}:${minutes}`
}