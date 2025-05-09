export async function POST() {
    // vaciamos la cookie
    const headers = new Headers({
      'Set-Cookie': `token=deleted; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    });
    return new Response('Logout', { status: 200, headers });
  }
  