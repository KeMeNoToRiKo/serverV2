# ServerV2

A lightning-fast Node.js Express server for querying a MongoDB Atlas database of questions and answers.  
This project is structured for scalability, maintainability, and ease of deployment.

---

## Features

- **REST API**: Query questions by `questionId` or `questionText`
- **MongoDB Atlas Integration**: Secure, cloud-hosted database
- **Rate Limiting**: Prevents abuse with configurable request limits
- **CORS Support**: Ready for cross-origin requests
- **Modular Structure**: Clean separation of routes and database logic
- **Logging**: Console logs for queries and results

---

## Project Structure

```
serverV2/
│
├── db/
│   └── mongo.js         # MongoDB connection and collection logic
├── routes/
│   └── search.js        # Search API route
├── .env                 # Environment variables (never commit secrets)
├── index.js             # Main server entry point
├── package.json         # Dependencies and scripts
├── testQuery.js         # Script for testing the search endpoint
├── run.bat              # Windows batch file to start the server
├── test.bat             # Windows batch file to test the endpoint
└── .gitignore           # Ignores sensitive and test files
```

---

## Getting Started

### 1. Clone the Repository

```sh
git clone <your-repo-url>
cd serverV2
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following (see sample in repo):

```
MONGO_URI=your-mongodb-atlas-uri
PORT=3000
```

### 4. Start the Server

```sh
npm start
```
or on Windows:
```sh
run.bat
```

The server will run on `http://localhost:3000` by default.

---

## API Usage

### Search Endpoint

**GET** `/search?questionId=<id>&questionText=<text>`

- Searches by `questionId` first. If not found, searches by `questionText`.
- At least one parameter is required.

**Example:**
```
GET http://localhost:3000/search?questionId=18853418
```

**Response:**
```json
{
  "_id": "...",
  "Title": "...",
  "Question": "...",
  "Answer": [
    {
      "Answer_Text": "...",
      "Answer_ID": "...",
      "Question_ID": "...",
      "Question_Type": "...",
      "Correct": true,
      "_id": "..."
    }
  ],
  "__v": 0
}
```

---

## Testing

You can test the endpoint using the provided script:

```sh
node testQuery.js
```
or
```sh
test.bat
```

Edit `testQuery.js` to change the query parameters as needed.

---

## Customization

- **Database Collection**: Change the collection name in `db/mongo.js` if needed.
- **Rate Limit**: Adjust the rate limit settings in `index.js`.
- **Logging**: Enhance or redirect logs as required.

---

## License

This project is licensed under the ISC License.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## Contact

For questions or support, please contact the maintainer.
