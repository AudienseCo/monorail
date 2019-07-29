# monorail

![](https://upload.wikimedia.org/wikipedia/en/4/44/Marge_vs._the_Monorail_(promo_card).png)

## Setup

### Docker

We use [docker-compose](https://docs.docker.com/compose/overview/) to run monorail.
There are two services:

- monorail: this is the main service
- monorail-test: this service runs the tests

You must set up the following environment variables:

- `GH_SECRET`: https://developer.github.com/v3/guides/basics-of-authentication/
- `GH_TOKEN`: https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line
- `SLACK_URL`: https://api.slack.com/incoming-webhooks

You can set them in the file `.env` in order to be automatically used by docker-compose. The file should look like

```
GH_SECRET=yourSecret
GH_TOKEN=yourToken
SLACK_URL=https://hooks.slack.com/services/yourToken
```

To run the monorail service execute:

```
docker-compose up monorail
```

To run the tests execute:

```
docker-compose run monorail-test
```

Remember that if you change the code, you have to build the images again:

```
docker-compose build
```

You can access the service using cURL or your favourite HTTP client to make requests. For example:

```
curl http://localhost:8484/slack-preview-release
```

### Native

TBC
