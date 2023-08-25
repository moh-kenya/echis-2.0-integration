# Development of the services

To setup the services, ensure you are running `Node Version 16` or higher.

To check your Node version run:

```
node -v
```

Once you have confirmed that you are running the required version, install dependancies and install nodemon to allow you to refresh the server automatically:

```
npm -i
```

```
npm -i -g nodemon
```

Make a copy of the `.env.sample` by running the following in your terminal:

```
cp .env.sample .env
```

Once done update the `.env` file with the updated values from the credentials file provided.

Once you have installed dependancies and updated the env file, start the main server by running:

```
nodemon forever.js
```

Once you have started the main server, you may start the mock server by running the following in another terminal tab or window:

```
nodemon ./test/mock-server/index.js
```

# Postman Collection for Testing

The Postman collection can be imported from test/PostmanCollection folder
