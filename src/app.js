import { Auth, getUser } from './auth';
import { getUserFragments, getFragmentById, postFragment } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  // const fragmentSection = document.querySelector('#fragment');
  const textFormSection = document.querySelector('#textFormSection');

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

  // Log the user info for debugging purposes
  console.log({ user });

  // Do an authenticated request to the fragments API server and log the result
  // GET /fragments/?expand=1
  const expandedFragments = await getUserFragments(user, 1);
  console.log(" user's existing fragments with all metadata: ", expandedFragments);

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  document.getElementById('types').addEventListener('change', (e) => {
    e.preventDefault();

    selectedType = e.target.value;
    console.log(`seleted type: ${selectedType}`);
  });

  let selectedType = 'text/plain';

  let textForm = document.getElementById('textForm');
  textForm.addEventListener('submit', handleTextForm);

  /**
   * when user submit the text, post that text and get all user text
   */
  async function handleTextForm(e) {
    e.preventDefault();

    try {
      console.log(
        `User input manually: ${document.getElementById('textFragment').value}`
      );

      await postFragment(
        user,
        document.getElementById('textFragment').value,
        selectedType
      );

      const fragment = await getUserFragments(user);
      console.log('fragment data:', { fragment });

      // Gets user's all fragment data
      if (!!fragment) {
        const getfragmentData = fragment.fragments.map(async (fragmentId, idx) => {
          return await getFragmentById(user, fragmentId).then((fragmentData) => {
            return `${idx + 1}: Content Type: ${fragmentData[0]}   ||   fragment: ${
              fragmentData[1]
            }`;
          });
        });

        const fragmentData = await Promise.all(getfragmentData);

        console.log('all fragment data', fragmentData);

        // Display user all fragments
        document.querySelector('.fragment').innerText = fragmentData.join('\n');

        // init text input box
        document.getElementById('textFragment').value = '';
      }
    } catch (err) {
      console.log(`FROM handleTextForm: ${err}`);
    }
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
