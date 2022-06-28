# CHART-IMG DISCORD BOT

It is a simple Discord bot based on [CHART-IMG](https://doc.chart-img.com) API with serverless Cloudflare Workers. It supports all public TradingView symbols, and the preset symbols can be customized by modifying the file `config.json`.

## Live Discord Bot

[Invite Link](https://discord.com/api/oauth2/authorize?client_id=989249881824718929&permissions=2147485696&scope=bot%20applications.commands)

You are welcome to use this bot if you don't want to customize your own. It will always run with the latest version.

## Requirement

- [Cloudflare](https://workers.cloudflare.com) Account
- [CHART-IMG](https://chart-img.com) Account API Key `CHART_IMG_API_KEY`
- [Discord](https://discord.com/developers/applications) Discrod Developer Portal `DISCORD_APPLICATION_ID`, `DISCORD_PUBLIC_KEY`, `DISCORD_TOKEN`

## Setup

### Wrangler Install & Login

To install [wrangler](https://github.com/cloudflare/wrangler2), ensure you have [npm](https://docs.npmjs.com/getting-started) installed, preferably using a Node version manager like [Volta](https://volta.sh) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues or to easily change Node.js versions, then run:

```
$ npm install -g wrangler
```

```
$ wrangler login
```

### Create Discord Bot

To start, you need to create a discord app through the [Discord Developer Dashboard](https://discord.com/developers/applications):

- Visit https://discord.com/developers/applications
- Click `New Application`, and choose a name
- Copy your `Application ID` and `Public Key`, and put them in the file `wrangler.toml`.

- Now click on the `Bot` tab on the left sidebar, and create a bot! You can choose the same name as your app.
- Grab the `token` for your bot, and store it somewhere safe. (For security reasons, you can only view your bot token once. If you misplace your token, you'll have to generate a new one.)

### wrangler.toml

```
DISCORD_APPLICATION_ID = "YOUR_DISCORD_APPLICATION_ID"
DISCORD_PUBLIC_KEY = "YOUR_DISCORD_PUBLIC_KEY"
```

### Environment Variable

Create secret environment variables using wrangler secret.

`wrangler secret put DISCORD_TOKEN --env production`

```
$ wrangler secret put DISCORD_TOKEN --env production
 ⛅️ wrangler 2.0.15
--------------------
Enter a secret value: ****************************************
🌀 Creating the secret for script chart-img-discord-bot-production
✨ Success! Uploaded secret DISCORD_TOKEN
```

`wrangler secret put CHART_IMG_API_KEY --env production`

```
$ wrangler secret put CHART_IMG_API_KEY --env production
 ⛅️ wrangler 2.0.15
--------------------
Enter a secret value: ****************************************
🌀 Creating the secret for script chart-img-discord-bot-production
✨ Success! Uploaded secret CHART_IMG_API_KEY
```

## Deploy

### Register Slash Commands

Register Discord slash commands.

`npm run setup:production`

```
$ npm run setup:production

> cf-chart-img-discord-bot@0.1.0 setup:production
> node src/setup.js --env production

(node:8118) ExperimentalWarning: Importing JSON modules is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)

? Enter DISCORD_TOKEN secret value :  [input is hidden]
```

### Publish Cloudflare Worker

Publish your Cloudflare Worker and get a invoke URL.

`npm run publish:production`

```
$ npm run publish:production

> cf-chart-img-discord-bot@0.1.0 publish:production
> wrangler publish --env production

 ⛅️ wrangler 2.0.15
--------------------
▲ [WARNING] Enabling node.js compatibility mode for built-ins and globals. This is experimental and has serious tradeoffs.
  Please see https://github.com/ionic-team/rollup-plugin-node-polyfills/ for more details.


Your worker has access to the following bindings:
- Vars:
  - DEBUG: "false"
  - DISCORD_APPLICATION_ID: "YOUR_DISCORD_APPLICATION_ID"
  - DISCORD_PUBLIC_KEY: "YOUR_DISCORD_PUBLIC_KEY..."
Total Upload: 215.95 KiB / gzip: 42.86 KiB
Uploaded chart-img-discord-bot-production (1.85 sec)
Published chart-img-discord-bot-production (0.22 sec)
  chart-img-discord-bot-production.YOUR_ID.workers.dev
```

### Set Discord Interactions Endpoint URL

Set your Interactions Endpoint URL `https://chart-img-discord-bot-production.YOUR_ID.workers.dev` from the previous step.

![general_info](doc/general_info.png?raw=true)

## Invite URL Generator

![invite_url](doc/invite_url.png?raw=true)

## Features

### Slash Commands

Slash Commands are the new, exciting way to build and interact with bots on Discord. With Slash Commands, all you have to do is type `/` and you're ready to use your preset commands.

- `/invite`
- `/price preset crypto`
- `/price preset stock`
- `/price preset forex`
- `/chart preset crypto`
- `/chart preset stock`
- `/chart preset forex`
