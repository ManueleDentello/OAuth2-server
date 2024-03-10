# OAuth2-server
This is an Oauth 2.0 server implementation written in Node.js as a PoC for the Security of Web Oriented Architectures course. The server is based on [Oauth2-server](https://www.npmjs.com/package/oauth2-server) and [express-oauth-server](https://www.npmjs.com/package/express-oauth-server). Authorization_code and refresh_token grants are supported.

<a id='install'></a>
# Installation and Setup

1. Clone this Repo
2. `cd` into the project root folder, and run `npm install`
    - If `npm` is not installed, install it and then run `npm install`
3. Rename `.env.example` to `.env` and fill it with all parameters
4. Generate certificate and key for SSL support (see below)
5. Run `npm start` to boot up the Oauth 2.0 Server
use `https:localhost:8443` or Postman to call endpoints

[back](#top)

<a id='database'></a>
# Database

The Oauth 2.0 Server require a MongoDB connection. The DB structure can be seen in `utilities/DB`.
In order to provide the connection string, you have to create a file called `.env` and insert with this structure
```bash
CONNECTSTRING = mongodb://127.0.0.1:1234/dbname
```
Keep in mind that writing "localhost" instead of 127.0.0.1 will not work for some reason.

[back](#top)

<a id='ssl'></a>
# SSL support

By default the Oauth 2.0 Server redirects all the connections to the HTTPS server. In order to get it to work you have to create a folder named `cert` and put inside the `server.cert` and `server.key` files.
You can generate them using the command:
```shell
openssl req -nodes -new -x509 -keyout server.key -out server.cert
```

[back](#top)

<a id='url'></a>
# URL Queries and Formatting

Once everything is set up the Server is able to handle these requests:

1. Client registration
1. User registration
3. Get Authorization Code
4. Get Token
5. Get Access to Protected Resource (the username)

This section will outline how each of these requests ought to be formatted to successfully go through.

[back](#top)

<a id='url-client'></a>
### Client registration

The request to register a client consists of a GET on the URL `/client/register`. The Server will send back a form to compile with the redirect URI.
The server will validate the form and send back a `client_id` and a `client_secret`. If you are using my [OAuth client](https://github.com/ManueleDentello/oauth_game_finder), save them in the .env file to permit the client to authenticate to the server when logging in. If you are using HTTP for testing purposes on the OAuth client, make sure to register the appropriate URI.

[back](#top)

<a id='url-user'></a>
### User registration

The request to register a user is a simple GET on the URL `/user/register`. The Server will send back a form to compile with the username, password and name of the user.
The server will validate the form and send back a success or error message.

[back](#top)

<a id='url-code'></a>
### Authorization Code

The request for an authorization code can be made using a GET on the url `/oauth/authorize`. It requires the following information:

- `client_id`: The unique string identifying a client
- `redirect_uri`: The place to redirect after receiving the code
- `response_type`: What the client is expecting. Should be "code"
- `state`: Provided by the client to prevent CSRF

These parameters have to be sent as URL Query Parameters like this: `/oauth/authorize?client_id=<ID>&redirect_uri=<URL>&response_type=code&state=<STATE>`

The server will respond with an error or a redirect to the redirect_uri.

[back](#top)

<a id='url-token'></a>
### Token

The request for an access token can be made using a POST on the url `/oauth/token`. It requires the following information (provided within the body of the request):

- `client_id`
- `client_secret`
- `grant_type`: "authorization_code" in this example
- `code`: The authorization code of previous step`
- `redirect_uri`

The request should additionally have the header `'Content-Type': 'application/x-www-form-urlencoded'`
The server will respond with an access token and a refresh token.

[back](#top)

<a id='url-token'></a>
### Refresh Token

The request for a new refreshed access token can be made using the same POST on the url `/oauth/token` (data in the body of the request), but swapping the `code` for `refresh_token` parameter:

- `client_id`
- `client_secret`
- `grant_type`
- `refresh_token`: The refresh token associated with the expiring access token
- `redirect_uri`

The request should additionally have the following header: `'Content-Type': 'application/x-www-form-urlencoded'`
The server will respond with an access token and a new refresh token.

[back](#top)

<a id='url-resource'></a>
### Access Protected Resource

An example of access to protected reosurce can be simulated using a GET on the URL `/secure` with a special header included:

```js
{
  Authorization: `${tokenType} ${token}`,
}
```

The server will respond with a positive messagge in case of a correct request.

Also, to demonstrate the complete OAuth flow, the `/username` endpoint has been created with the same logic: The server will respond with the username of the logged user.

[back](#top)
