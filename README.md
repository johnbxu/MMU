# Mind Maker Upper

This is a decision-maker for you & your friends! If you ever found yourself struggling to make a decision as a group, use this service. People respond to your polls using a preferential voting system based on the Borda count.

## Screenshots

![screenshot of the home page](https://github.com/johnbxu/MMU/blob/dev/docs/Home%20Page.png)
![screenshot of creating a poll](https://github.com/johnbxu/MMU/blob/dev/docs/New%20Poll.png)
![screenshot of voting on a poll](https://github.com/johnbxu/MMU/blob/dev/docs/Votes%20Page.png)

## Getting Started

1. Clone this repository
2. Setup an empty database in your
3. Create the `.env` to include your db details
4. Update the .env file with your correct local information
5. Install dependencies: `npm i`
6. Run migrations: `npm run knex migrate:latest`
7. Run the server: `npm run local`
8. Visit `http://localhost:8080/`

## Dependencies

- Node 5.10.x or above
- NPM 3.8.x or above
