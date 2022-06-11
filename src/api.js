// fragments microservice API
const apiUrl = process.env.API_URL;
console.log(apiUrl);

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user) {
  console.log('Requesting user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Got user fragments data', { data });

    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}

/**
 * Gets an authenticated user's fragment data with the given id
 * @param {string} user
 * @param {string} id
 */
export async function getFragmentById(user, id) {
  console.log('Requesting user fragments data by id...');

  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    console.log('Got user fragments data with given id', { data });

    return { data };
  } catch (err) {
    console.error('Unable to call GET /v1/fragment/:id', { err });
  }
}

/**
 * Creates a new fragment for the current (i.e., authenticated user)
 * @param {string} user
 * @param {string} value
 */
export async function postFragment(user, value) {
  console.log('Post fragment data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'post',
      headers: user.authorizationHeaders('text/plain'),
      body: value,
    });
    if (!res.ok) {
      throw new Error(`{res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Posted fragments data', { data });
  } catch (err) {
    console.error('Unable to call POST /v1/fragments' + err.message, { err });
  }
}
