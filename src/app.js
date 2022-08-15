const mime = require('mime');
import { Auth, getUser } from './auth';
import {
  getUserFragments,
  getFragmentById,
  postFragment,
  deleteFragment,
  updateFragment,
  getFragmentByIdInfo,
} from './api';
import {
  btnSection,
  displayFeatureBtn,
  createFeatureBtn,
  convertFeatureBtn,
  updateFeatureBtn,
  deleteFeatureBtn,
} from './uiElements/mainUiElements';
import {
  displayFeatureSection,
  displayFragmentListSection,
  displayFragmentsListLabel,
  displayFragmentListSelect,
  displaySpecificFragmentSection,
  displaySpecificFragmentBox,
  displaySpecificFragmentImageBox,
  displaySpecificFragmentDataBox,
  displayFragmentListSectionTitle,
} from './uiElements/displayUiElements';
import {
  createFragmentDataSection,
  createFeatureSection,
  createOptionSection,
  textOptionBtn,
  fileOptionBtn,
  createTypeSection,
  createForm,
  createTextInputBox,
  createImportFileBox,
  createTextInput,
  createSubmitBtn,
  createdFragmentBox,
  createdFragmentTextBox,
  createdFragmentImageBox,
  createOptionSectionTitle,
  createOptionSectionLabe,
  createTextInputBoxLabel,
  createImportFileBoxLabel,
} from './uiElements/createUiElements';
import {
  convertFeatureSection,
  convertTypeSection,
  convertTypeForm,
  convertedFragmentSection,
  convertedFragmentBox,
  convertedFragmentDataBox,
  convertedFragmentImageBox,
} from './uiElements/convertUIElements';
import {
  updateFeatureSection,
  updatedFragmentBox,
  updatedFragmentTextBox,
  updatedFragmentImageBox,
} from './uiElements/updateUIElements';
import {
  deleteFeatureSection,
  deleteOptions,
  deleteSpecificFragment,
  deleteAllFragment,
  deleteSubmitSection,
  deleteSubmitBtnSection,
  deleteSubmitBtn,
  deletedInformBoxSection,
  deletedInformBox,
} from './uiElements/deleteUIElements';

async function init() {
  // User Login and Logout Section
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');

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
  console.log({ user }, 'Authenticated AWS Cognito User');

  // ! GET /fragments/?expand=1
  // Do an authenticated request to the fragments API server and log the result
  const expandedFragments = await getUserFragments(user, 1);
  console.log({ expandedFragments }, "user's existing fragments with all metadata");

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  // Gets user's all fragment data
  const getAllFragments = async () => {
    const fragment = await getUserFragments(user);

    while (displayFragmentListSelect.hasChildNodes()) {
      displayFragmentListSelect.removeChild(displayFragmentListSelect.firstChild);
    }

    if (fragment.fragments.length > 0) {
      const getfragmentData = fragment.fragments.map(async (fragmentId, idx) => {
        return await getFragmentById(user, fragmentId).then((fragmentData) => {
          return { id: fragmentData.id, type: fragmentData.ContentType };
        });
      });

      const fragmentData = await Promise.all(getfragmentData);

      displayFragmentsListLabel.innerText = `Total Fragements: ${fragmentData.length}`;

      const option = new Option();
      option.value = 'none';
      option.text = '==== Select a fragment ====';
      displayFragmentListSelect.appendChild(option);

      fragmentData.map((fragment, idx) => {
        const fragmentOption = new Option();
        fragmentOption.id = fragment.id;
        fragmentOption.value = JSON.stringify({ id: fragment.id, type: fragment.type });
        fragmentOption.text = `${fragment.id} - ${fragment.type}`;
        displayFragmentListSelect.appendChild(fragmentOption);
      });
    } else {
      const option = new Option();
      option.value = 'none';
      option.text = 'There is no any Fragments';
      displayFragmentListSelect.appendChild(option);
    }
  };

  // Generate default HTML formed string to display fragment's info
  const creatinginnerHTML = (id, type, created, updated) => {
    return `
    <span style="font-size: 18px; font-weight: bold">ID: </span>
    <span style="font-size: 14px;">${id}</span>
    <br />
    <span style="font-size: 18px; font-weight: bold">Type: </span>
    <span style="font-size: 14px;">${type}</span>
    <br />
    <span style="font-size: 18px; font-weight: bold">Created Date: </span>
    <span style="font-size: 14px;">${created}</span>
    <br />
    <span style="font-size: 18px; font-weight: bold">Updated Date: </span>
    <span style="font-size: 14px;">${updated}</span>
    <br />
    <span style="font-size: 18px; font-weight: bold">Data: </span>
  `;
  };

  // Main CURD feature Button Section
  let selectedFeature;
  btnSection.addEventListener('click', async (e) => {
    e.preventDefault();

    displayFeatureBtn.disabled = false;
    createFeatureBtn.disabled = false;
    convertFeatureBtn.disabled = false;
    updateFeatureBtn.disabled = false;
    deleteFeatureBtn.disabled = false;

    displayFeatureSection.hidden = true;
    createFeatureSection.hidden = true;
    convertFeatureSection.hidden = true;
    updateFeatureSection.hidden = true;
    deleteFeatureSection.hidden = true;
    deleteSubmitSection.hidden = true;
    displayFragmentListSection.hidden = true;
    displaySpecificFragmentSection.hidden = true;
    createFragmentDataSection.hidden = true;

    // case of display feature
    if (e.target.id === 'displayFeatureBtn') {
      selectedFeature = 'displayFeature';

      displayFeatureBtn.disabled = true;
      displayFeatureSection.hidden = false;
      displayFragmentListSection.hidden = false;
      displayFragmentListSectionTitle.innerText = 'All Fragment';

      await getAllFragments();
    }

    // case of create feature
    if (e.target.id === 'createFeatureBtn') {
      selectedFeature = 'createFeature';

      createFeatureBtn.disabled = true;

      createFragmentDataSection.hidden = false;
      createOptionSection.hidden = false;
      textOptionBtn.disabled = false;
      fileOptionBtn.disabled = false;

      createTypeSection.hidden = true;

      createSubmitBtn.disabled = true;
      createTextInputBox.hidden = true;

      createImportFileBox.hidden = true;

      createOptionSectionTitle.innerText = 'Create the fragment';
      createOptionSectionLabe.innerText = '1. Select how to create the Fragment';
      createTextInputBoxLabel.innerText = '3. Enter the data';
      createImportFileBoxLabel.innerText = '3. Import a file';
    }

    // case of convert feature
    if (e.target.id === 'convertFeatureBtn') {
      selectedFeature = 'convertFeature';

      convertFeatureBtn.disabled = true;

      displayFeatureSection.hidden = false;
      displayFragmentListSection.hidden = false;
      displayFragmentListSectionTitle.innerText = '1. Choose existing your fragment';

      convertFeatureSection.hidden = false;
      convertTypeSection.hidden = true;
      convertedFragmentSection.hidden = true;
      convertedFragmentBox.innerHTML = '';
      convertedFragmentDataBox.innerHTML = '';
      convertedFragmentImageBox.src = '';

      await getAllFragments();
    }

    // case of update feature
    if (e.target.id === 'updateFeatureBtn') {
      selectedFeature = 'updateFeature';

      updateFeatureBtn.disabled = true;

      displayFeatureSection.hidden = false;
      displayFragmentListSection.hidden = false;
      displayFragmentListSectionTitle.innerText = '1. Choose existing your fragment';

      await getAllFragments();
    }

    // case of delete feature
    if (e.target.id === 'deleteFeatureBtn') {
      selectedFeature = 'deleteFeature';
      deleteFeatureBtn.disabled = true;
      deleteFeatureSection.hidden = false;

      deleteSpecificFragment.disabled = false;
      deleteAllFragment.disabled = false;

      deletedInformBox.innerText = '';
    }
  });

  // It is displayed a Fragment infomation depending on the main feature
  displayFragmentListSelect.addEventListener('change', async (e) => {
    e.preventDefault();
    displaySpecificFragmentBox.innerHTML = '';
    displaySpecificFragmentDataBox.innerHTML = '';
    displaySpecificFragmentImageBox.src = '';

    try {
      const fragmentInfo = e.target.value;
      const fragment = await getFragmentByIdInfo(user, JSON.parse(fragmentInfo).id);
      const { data } = await getFragmentById(
        user,
        fragment.fragment.id,
        mime.getExtension(fragment.fragment.type)
      );

      if (!!fragment.fragment && data) {
        displaySpecificFragmentSection.hidden = false;

        const fragementHTML = creatinginnerHTML(
          fragment.fragment.id,
          fragment.fragment.type,
          fragment.fragment.created,
          fragment.fragment.updated
        );

        displaySpecificFragmentBox.innerHTML = fragementHTML;

        if (fragment.fragment.type.startsWith('image/')) {
          displaySpecificFragmentImageBox.src = window.URL.createObjectURL(data);
        } else {
          displaySpecificFragmentDataBox.innerHTML =
            typeof data === 'object' ? JSON.stringify(data) : data;
        }
      }

      if (selectedFeature === 'convertFeature') {
        convertTypeSection.hidden = false;
      }

      if (selectedFeature === 'updateFeature') {
        createFragmentDataSection.hidden = false;
        createOptionSection.hidden = false;
        textOptionBtn.disabled = false;
        fileOptionBtn.disabled = false;

        createTypeSection.hidden = true;

        createSubmitBtn.disabled = true;
        createTextInputBox.hidden = true;

        createImportFileBox.hidden = true;

        createOptionSectionTitle.innerText = '2. Update the fragment';
        createOptionSectionLabe.innerText = '1. Select how to update the Fragment';
        createTextInputBoxLabel.innerText = '2. Enter the data';
        createImportFileBoxLabel.innerText = '2. Import a file';

        updateFeatureSection.hidden = true;

        selectedType = fragment.fragment.type;
      }

      if (selectedFeature === 'deleteFeature') {
        deleteSubmitSection.hidden = false;
        deleteSubmitBtnSection.hidden = false;
      }
    } catch (error) {
      console.log({ error }, 'Error occurred during GET BY ID with the Fragment');
    }
  });

  // Convert the Fragment
  convertTypeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedConversionType = document.getElementById('convertTypes').value;

    if (selectedConversionType !== 'none') {
      try {
        convertedFragmentSection.hidden = false;

        const selectedFragmentValue = displayFragmentListSelect.value;
        const selectedFragment = await getFragmentByIdInfo(
          user,
          JSON.parse(selectedFragmentValue).id
        );
        const { data } = await getFragmentById(
          user,
          selectedFragment.fragment.id,
          selectedConversionType
        );

        if (selectedFragment.fragment && data) {
          if (selectedFragment.fragment.type.startsWith('image/')) {
            convertedFragmentImageBox.src = window.URL.createObjectURL(data);
          } else {
            convertedFragmentDataBox.innerText =
              typeof data === 'object' ? JSON.stringify(data) : data;
          }
        }
      } catch (error) {
        alert('Cannot convert the selected fragment to seleted type');
        console.log({ error }, 'Error occurred during GET BY ID with the Fragment');
      }
    } else {
      alert('You must choose the type you want to convert');
    }
  });

  // ======== Create and Update Section ========
  // Variables
  let importedFile = undefined;
  let importedFileType = '';
  let selectedType = 'text/plain'; // default select type

  // 1. Select create options
  createOptionSection.addEventListener('click', (e) => {
    createTextInputBox.hidden = true;
    createImportFileBox.hidden = true;
    createFeatureSection.hidden = true;

    createdFragmentTextBox.innerHTML = '';
    createdFragmentImageBox.src = '';

    if (e.target.id === 'textOptionBtn') {
      textOptionBtn.disabled = true;
      fileOptionBtn.disabled = false;

      if (selectedFeature === 'createFeature') {
        createTypeSection.hidden = false;
        createTextInputBox.hidden = false;
      } else {
        createTextInputBox.hidden = false;
      }

      document.getElementById('imagePngOpt').disabled = true;
      document.getElementById('imageJpegOpt').disabled = true;
      document.getElementById('imageWebpOpt').disabled = true;
      document.getElementById('imageGifOpt').disabled = true;

      importedFile = undefined;
    }

    if (e.target.id === 'fileOptionBtn') {
      textOptionBtn.disabled = false;
      fileOptionBtn.disabled = true;

      if (selectedFeature === 'createFeature') {
        createTypeSection.hidden = false;
        createImportFileBox.hidden = false;
      } else {
        createImportFileBox.hidden = false;
      }

      document.getElementById('imagePngOpt').disabled = false;
      document.getElementById('imageJpegOpt').disabled = false;
      document.getElementById('imageWebpOpt').disabled = false;
      document.getElementById('imageGifOpt').disabled = false;
      createTextInput.value = '';
    }
  });

  // 2. Select the type the use wants to create
  createTypeSection.addEventListener('change', (e) => {
    e.preventDefault();

    selectedType = e.target.value;
  });

  // Tracking the imported file
  createImportFileBox.addEventListener('change', (e) => {
    const files = e.target.files; // File object
    importedFile = files[0];

    if (
      (importedFile.name.split('.')[1] === 'md') |
      (importedFile.name.split('.')[1] === 'markdown')
    ) {
      importedFileType = 'text/markdown';
    } else {
      importedFileType = importedFile.type;
    }

    if (!!importedFile) {
      createSubmitBtn.disabled = false;
    }
  });

  // Tracking the inputted text
  createTextInput.addEventListener('keyup', (e) => {
    if (e.target.value) {
      createSubmitBtn.disabled = false;
    }
  });

  // 3. Submit
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // When a user imported a file
    if (!!importedFile) {
      if (importedFileType !== selectedType) {
        alert(
          'The attached file extension does not match the selected extension.\nPlease check again'
        );
      } else {
        let reader = new FileReader();

        createdFragmentTextBox.innerHTML = '';
        createdFragmentImageBox.src = '';

        reader.onload = async (progressEvent) => {
          try {
            if (selectedFeature === 'createFeature') {
              const fragment = await postFragment(
                user,
                progressEvent.target.result,
                selectedType
              );

              if (!!fragment) {
                const { data } = await getFragmentById(user, fragment.fragment.id);

                if (data) {
                  createFeatureSection.hidden = false;
                  document.getElementById('createImportFile').value = '';

                  const fragementHTML = creatinginnerHTML(
                    fragment.fragment.id,
                    fragment.fragment.type,
                    fragment.fragment.created,
                    fragment.fragment.updated
                  );

                  createdFragmentBox.innerHTML = fragementHTML;

                  if (selectedType.startsWith('image/')) {
                    createdFragmentImageBox.src = window.URL.createObjectURL(data);
                  } else {
                    createdFragmentTextBox.innerHTML =
                      typeof data === 'object' ? JSON.stringify(data) : data;
                  }
                }
              }
            }

            if (selectedFeature === 'updateFeature') {
              const selectedFragmentValue = displayFragmentListSelect.value;

              const fragment = await updateFragment(
                user,
                progressEvent.target.result,
                JSON.parse(selectedFragmentValue).id,
                selectedType
              );

              if (!!fragment) {
                const { data } = await getFragmentById(
                  user,
                  fragment.fragment.id,
                  mime.getExtension(fragment.fragment.type)
                );

                if (data) {
                  updateFeatureSection.hidden = false;
                  document.getElementById('createImportFile').value = '';

                  const fragementHTML = creatinginnerHTML(
                    fragment.fragment.id,
                    fragment.fragment.type,
                    fragment.fragment.created,
                    fragment.fragment.updated
                  );

                  updatedFragmentBox.innerHTML = fragementHTML;

                  if (selectedType.startsWith('image/')) {
                    updatedFragmentImageBox.src = window.URL.createObjectURL(data);
                  } else {
                    updatedFragmentTextBox.innerHTML =
                      typeof data === 'object' ? JSON.stringify(data) : data;
                  }
                }
              }
            }
          } catch (error) {
            alert('Something went wrong,,\nPlease try again!');
            console.error({ error }, 'Error occurred during POST with imported file');
          }
        };

        reader.readAsArrayBuffer(importedFile);
      }
    }
    // When a user inputs text manually
    else {
      try {
        if (selectedFeature === 'createFeature') {
          const fragment = await postFragment(user, createTextInput.value, selectedType);

          if (!!fragment) {
            createFeatureSection.hidden = false;
            createdFragmentTextBox.innerHTML = '';
            createdFragmentImageBox.src = '';

            createTextInput.value = '';

            const { data } = await getFragmentById(user, fragment.fragment.id);

            if (data) {
              const fragementHTML = creatinginnerHTML(
                fragment.fragment.id,
                fragment.fragment.type,
                fragment.fragment.created,
                fragment.fragment.updated
              );

              createdFragmentBox.innerHTML = fragementHTML;

              createdFragmentTextBox.innerHTML = `
                  <span style="font-size: 20px;">${data}</span>
                  `;
            }
          }
        }

        if (selectedFeature === 'updateFeature') {
          try {
            const selectedFragmentValue = displayFragmentListSelect.value;

            const fragment = await updateFragment(
              user,
              createTextInput.value,
              JSON.parse(selectedFragmentValue).id,
              selectedType
            );

            if (!!fragment) {
              const { data } = await getFragmentById(
                user,
                fragment.fragment.id,
                mime.getExtension(fragment.fragment.type)
              );

              if (data) {
                updateFeatureSection.hidden = false;

                const fragementHTML = creatinginnerHTML(
                  fragment.fragment.id,
                  fragment.fragment.type,
                  fragment.fragment.created,
                  fragment.fragment.updated
                );

                updatedFragmentBox.innerHTML = fragementHTML;

                updatedFragmentTextBox.innerHTML =
                  typeof data === 'object' ? JSON.stringify(data) : data;
              }
            }
          } catch (error) {
            console.log('update error', { error });
          }
        }
      } catch (error) {
        alert('Something went wrong,,\nPlease try again!');
        console.error({ error }, 'Error occurred during POST with text input');
      }
    }
  });

  // ======== Delete Section ========
  // Track how to delete
  deleteOptions.addEventListener('click', async (e) => {
    if (e.target.id === 'deleteSpecificFragment') {
      deleteSpecificFragment.disabled = true;
      deleteAllFragment.disabled = false;
      deleteSubmitSection.hidden = true;
      deleteSubmitBtn.innerText = 'Delete!';

      displayFeatureSection.hidden = false;
      displayFragmentListSection.hidden = false;
      displayFragmentListSectionTitle.innerText = 'All Fragment';

      deletedInformBoxSection.hidden = true;

      await getAllFragments();
    }

    if (e.target.id === 'deleteAllFragment') {
      deleteAllFragment.disabled = true;
      deleteSpecificFragment.disabled = false;
      displayFeatureSection.hidden = true;
      displaySpecificFragmentSection.hidden = true;

      deleteSubmitSection.hidden = false;
      deleteSubmitBtn.innerText = 'Delete All!';

      deletedInformBoxSection.hidden = true;
    }
  });

  // Delete the Fragment
  deleteSubmitBtn.onclick = async () => {
    try {
      if (deleteSpecificFragment.disabled) {
        const selectedFragmentValue = displayFragmentListSelect.value;

        await deleteFragment(user, JSON.parse(selectedFragmentValue).id);
      }

      if (deleteAllFragment.disabled) {
        const fragment = await getUserFragments(user);

        const getfragmentData = fragment.fragments.map(async (fragmentId, idx) => {
          const deleted = await deleteFragment(user, fragmentId);

          if (deleted.status !== 'ok') {
            throw new Error(`Failed delete Fragment with id: ${fragmentId}`);
          }
        });

        await Promise.all(getfragmentData);
      }
    } catch (error) {
      console.error({ error }, 'Error occurred during DELETE');
    } finally {
      deletedInformBox.innerText = 'Successfully Delete!';
      displayFeatureSection.hidden = true;
      displaySpecificFragmentSection.hidden = true;
      deleteSubmitBtnSection.hidden = true;
      deletedInformBoxSection.hidden = false;

      deleteSpecificFragment.disabled = false;
      deleteAllFragment.disabled = false;
    }
  };
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
