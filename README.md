# Test track

A Discord bot with benchmarking and eval capabilities.

## Commands

### `<prefix>eval` (text command)

Evaluates JavaScript code.

### `/benchmark` (slash command)

Opens a model which accepts two code inputs and runs them against each other. The results are displayed once the benchmark is complete.

## Running the bot

A docker file is provided however not tested. We recommend you run this on a VPS and keep the process alive using a process manager such as PM2.

1. Copy the `.env.example` file to `.env` and fill in the values.
2. Run `yarn install` to install the dependencies. If you do not have yarn installed, run `npm install -g yarn` to install it.
3. Build the project using `yarn build`.
4. Start the bot using `yarn start`. If you are using PM2, run `pm2 start dist/index.js --time --name test-track`.
