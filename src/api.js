// fragments microservice API
const apiUrl = process.env.API_URL;

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user, expand = 0) {
  console.log('Requesting user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments?expand=${expand}`, {
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
export async function getFragmentById(user, id, ext = '') {
  console.log('Requesting user fragments data by id...' + id);

  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}.${ext}`, {
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.text();
    const contentType = res.headers.get('Content-type');

    if (contentType.includes('text/')) {
      console.log(`Got user fragments text data with given id... ${data}`);
      return [contentType, data];
    } else if (contentType.includes('application/json')) {
      try {
        console.log(`Got user fragments json data with given id... ${data}`);
        return [contentType, data];
      } catch (err) {
        console.log(`Unalbe to call GET /v1/fragments/:id \n ${err}`);
      }
    }

    return data;
  } catch (err) {
    console.log('Unable to call GET /v1/fragment/:id', { err });
  }
}

/**
 * Creates a new fragment for the current (i.e., authenticated user)
 * @param {string} user
 * @param {string} value
 */
export async function postFragment(user, value, contentType) {
  console.log('Post fragment data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'post',
      headers: user.authorizationHeaders(contentType),
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
