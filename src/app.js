import { Auth, getUser } from './auth';
import { getUserFragments, getFragmentById, postFragment } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const fragmentSection = document.querySelector('#fragment');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  // Do an authenticated request to the fragments API server and log the result
  getUserFragments(user);

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  /**
   * when user submit the text, post that text and get all user text
   */
  const fragmentForm = document.querySelector('form');
  fragmentForm.addEventListener('submit', postFunction);

  async function postFunction(e) {
    e.preventDefault();
    console.log('input in index.html: ' + document.getElementById('textFragment').value);

    // Creates a new fragment
    await postFragment(user, document.getElementById('textFragment').value);

    // Gets user's all fragments
    const fragment = await getUserFragments(user);
    console.log('fragment data: ', { fragment });

    // Gets user's all fragment data
    if (!!fragment) {
      const getfragmentData = fragment.fragments.map(async (fragmentId, idx) => {
        return await getFragmentById(user, fragmentId).then((fragmentData) => {
          return `${idx + 1}: ${fragmentData.data['fragmentData']}`;
        });
      });

      const fragmentData = await Promise.all(getfragmentData);

      // Display user all fragments
      fragmentSection.querySelector('.fragment').innerText = fragmentData.join('\n');

      // init text input box
      document.getElementById('textFragment').value = '';
    }
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
