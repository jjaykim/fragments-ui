// fragments microservice API
const apiUrl = process.env.API_URL;

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user, expand = 0) {
  console.log('==== Requesting user fragments data ====');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments?expand=${expand}`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log({ data }, 'Got user fragments data');

    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}

/**
 * Gets an authenticated user's fragment data with the given id
 */
export async function getFragmentById(user, id, ext = '') {
  console.log('==== Requesting user fragments data by ' + id + ' ====');

  try {
    const res =
      ext.length > 0
        ? await fetch(`${apiUrl}/v1/fragments/${id}.${ext}`, {
            headers: user.authorizationHeaders(),
          })
        : await fetch(`${apiUrl}/v1/fragments/${id}`, {
            headers: user.authorizationHeaders(),
          });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('Content-type');

    if (contentType.startsWith('text/'))
      return { id: id, ContentType: contentType, data: await res.text() };

    if (contentType.includes('application/json'))
      return { id: id, ContentType: contentType, data: await res.text() };

    if (contentType.startsWith('image/')) {
      const myBlob = await res.blob();
      return { id: id, ContentType: contentType, data: myBlob };
    }
  } catch (err) {
    console.log('Unable to call GET /v1/fragment/:id', { err });
  }
}

/**
 * get the metadata for one of their existing fragments with the specified id
 */
export async function getFragmentByIdInfo(user, id) {
  console.log('==== Requesting user fragments data by with info' + id + ' ====');

  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}/info`, {
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragments/:id/info', { err });
    throw new Error(err);
  }
}

/**
 * Creates a new fragment for the current (i.e., authenticated user)
 */
export async function postFragment(user, value, contentType) {
  console.log('==== Posting fragment data ====');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: user.authorizationHeaders(contentType),
      body: value,
    });

    if (!res.ok) {
      throw new Error(`{res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error('Unable to call POST /v1/fragments' + err.message, { err });
  }
}

/**
 * update the data for their existing fragment with the specified id
 */
export async function updateFragment(user, value, id, contentType) {
  console.log('==== Updating fragment data ====');

  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: 'PUT',
      headers: user.authorizationHeaders(contentType),
      body: value,
    });

    if (!res.ok) {
      throw new Error(`{res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error('Unable to call PUT /v1/fragments', { err });
  }
}

/**
 * Delete fragment from the server
 */
export async function deleteFragment(user, id) {
  console.log('==== Deleting fragment data ====');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: 'DELETE',
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error('Unable to call DELETE /v1/fragments', { err });
  }
}
