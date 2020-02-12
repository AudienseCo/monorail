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
- `AWS_ACCESS_KEY_ID`: https://docs.aws.amazon.com/amazonswf/latest/awsrbflowguide/set-up-creds.html
- `AWS_SECRET_ACCESS_KEY`: https://docs.aws.amazon.com/amazonswf/latest/awsrbflowguide/set-up-creds.html
- `AWS_DEFAULT_REGION`: https://docs.aws.amazon.com/cli/latest/reference/configure/list.html
- `AWS_SESSION_TOKEN`: https://docs.aws.amazon.com/cli/latest/reference/sts/get-session-token.html


You can set them in the file `.env` in order to be automatically used by docker-compose. The file should look like

```
GH_SECRET=yourSecret
GH_TOKEN=yourToken
SLACK_URL=https://hooks.slack.com/services/yourToken
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_DEFAULT_REGION=your_aws_default_region
AWS_SESSION_TOKEN=your_temporal_token
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

You can access the service using cURL or your favourite HTTP client to make requests.

Example to get a deployment preview:

```shell
curl http://localhost:8484/slack-preview-release
```

Example to launch a deployment:
```shell
curl http://localhost:8484/deploy?showPreview=true
```

### Native

TBC
