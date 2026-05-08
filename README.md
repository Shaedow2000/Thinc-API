# Thinc WebApp API source code.

Thinc WebApp notes API source code, with account management and authentication features.

![Static Badge](https://img.shields.io/badge/Thinc-API?style=plastic&logo=github&logoColor=white&label=Github&labelColor=black&color=white&link=https%3A%2F%2Fgithub.com%2FShaedow2000%2FThinc-API)
![Static Badge](https://img.shields.io/badge/Thinc-API?style=plastic&logo=codeberg&logoColor=white&label=Codeberg&labelColor=blue&color=white&link=https%3A%2F%2Fcodeberg.org%2FShaedow2000%2FThinc-API)
![Static Badge](https://img.shields.io/badge/JavaScript-lang?style=plastic&logo=javascript&logoColor=white&label=Lang&labelColor=yellow&color=white)

## I - Features

### Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- NodeMailer
- Bcrypt

### Routes

#### /auth:

- **/register**: Registration route. [ *POST* ]
- **/verify**: Email verification route. [ *POST* ]
- **/reverify**: Resend verification code route. [ *POST* ]
- **/login**: Login route. [ *GET* ]
- **/unregister**: Remove account route. [ *DELETE* ]

#### /api:

**/notes**

- **GET**: Get all notes for specific user using the JWT token.
- **POST**: Post a new notes for a specific user.

**/task/:id**

- **GET**: Get one note by mongodb ObjectId.
- **PATCH**: Update one note by mongodb ObjectId.
- **DELETE**: Delte one note by mongodb ObjectId.

### Email verification

The app comes with an email verification system that you can setup with your own zoho mail, or you can change the SMTP provider.
For more info on how to change these settings and setup it up, go [here](https://github.com/Shaedow2000/Thinc-API/edit/main/README.md#email-smtp-setup)

## II - Setup

### Installation

- To install the API, just clone the repo:

```bash
git clone 'https://github.com/Shaedow2000/Thinc-API'
```

or

```bash
git clone 'https://codeberg.org/Shaedow2000/Thinc-API'
```

- Then run:

```bash
npm i
npm run dev
```

### Env file

Create a .env file in the root of the directory, then fill it with the values found in the [.env.example file](https://github.com/Shaedow2000/Thinc-API/edit/main/.env.example)

### Email SMTP Setup

- If you are using `Zoho Mail`, just follow the setps shown above.
- If you want to use `Google Mail` or `Outlook` or `Yahoo Mail` or any other mail provider with **SMTP**, go to ./src/config/mail.js and change the host option to whatever email provider you want.

```javascript
// ./src/config/mail.js file
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com", // change this to smtp.google.com for google or any other provider, just go search for the specific smtp link for each provider before writing it here.
  port: 587,
  secure: false,
  auth: {
    user: process.env.ZOHO_MAIL,
    pass: process.env.ZOHO_MAIL_PASSWORD,
  },
});
```

### DataBase setup

- Go to [mongodb](mongodb.com), create an account or sign in.
- Create a new _Cluster_ if you don't already have one.
- Click on connect, then copy the URI provided.
- Paste the URI in the .env file as show [here](github.com/Shaedow2000/Thinc-API/edit/main/README.md#Env%20file)
- Add the _database_ name in the URI. (see link exmaple)

```
mongodb+srv://username:password@cluster-name.xxxxxxx.mongodb.net/database-name?appName=app-name
```

## III - Contributions

All contributions are welcome !!
Just wait for an issue to open, and you can open your _PR_ after getting permission to be assigned to the issue.

## IV - LICENSE

Maintained by **_Shaedow2000_** under the `Apache License Version 2.0` © 2026.
