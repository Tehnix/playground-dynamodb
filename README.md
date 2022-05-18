# Playground: DynamoDB
About Playground to play around with and show DynamoDB usage

## Getting Started 🚀

Install the various dependencies:
- `npm i`

Set up a DynamoDB table in your AWS account (assumes you are authenticated) using the [AWS CLI](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/create-table.html):

```bash
$ aws dynamodb create-table \
    --table-name study-club-session \
    --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \
    --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST # Use on-demand pricing.
```

If you're setting it up locally, you can instead use the following (notice the `endpoint-url` and `provisioned-throughput`):

```bash
$ aws dynamodb create-table --endpoint-url http://localhost:8000 \
    --table-name study-club-session \
    --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \
    --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 # Is ignored in local, but required.
```

## Table Design

A nominee looks like the following:

```javascript
{
  firstName: "Jen",
  lastName: "Doe",
  nomineeEmail: "222222@gmail.com",
  submissionId: "20220129T220232795Z",
  timestamp: "2022-01-29T22:02:45.197Z",
  // .... story and etc
}

{
  firstName: "Jen",
  lastName: "Doe",
  nomineeEmail: "222222@gmail.com",
  voterEmail: "333@gmail.com",
  submissionId: "20220129T220232795Z",
  timestamp: "2022-01-29T22:02:45.197Z",
  // .... story and etc
}
```

We want to design something that fits with the following Access Patterns:
- Get base profile: GetItem on `pk = "C8CD..."`
, `sk = "nomineeProfile"`
- Get all stories and base profile: Query on `pk = "C8CD..."`
, `begins_with(sk, "nomineeProfile")`
- Get all data from a nominee: Query on `pk = "C8CD..."`
- Get only all stories: Query on `pk = "C8CD..."`
, `begins_with(sk, "nomineeProfile#")`
- Get all votes: Query on `pk = "C8CD..."`
, `begins_with(sk, "vote#")`
- Get nominee by email: Query on GSI `nomineeEmail = "ckl@famly.co"`

| pk | sk | timestamp | nomineeEmail (GSI PK) | hashName | firstName | lastName | story | profilePicture | votes | zapierHookId | s3Object | nominatorEmail | nominatorFirstName | nominatorLastName | voterEmail |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C8CD... | nomineeProfile | ‣ | ckl@famly.co | Christian Kjær | Christian | Kjær Laustsen |  | https://.... | 2 | ads14313-123... | childrens-champion-... |  |  |  |  |
| C8CD... | nomineeProfile#test@example.com | ‣ |  |  |  |  | Christian has been... |  | 0 | bds14313-123... |  | john@famly.co | John | Doe |  |
| C8CD... | nomineeProfile#other@example.com | ‣ |  |  |  |  | I've always liked when... |  | 0 | sds14313-123... |  | alice@famly.co | Alice | Bobsen |  |
| C8CD... | vote#test@example.com | ‣ |  |  |  |  |  |  | 0 | cs113-... |  |  |  |  | test@example.com |
| C8CD... | vote#other@example.com | ‣ |  |  |  |  |  |  | 0 | os912-... |  |  |  |  | other@example.com |


## Examples

Query data using the AWS CLI ([docs](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/query.html)):

```bash
$ aws dynamodb query \
    --table-name study-club-session \
    --key-condition-expression "pk = :val" \
    --expression-attribute-values '{":val":{"S":"test"} }' # Add --index-name <name> for a GSI.
```

Adding a GSI to an existing Table:

```bash
$ aws dynamodb update-table \
    --table-name study-club-session \
    --attribute-definitions AttributeName=nomineeEmail,AttributeType=S  \
    --global-secondary-index-updates \
        "[
            {
                \"Create\": {
                    \"IndexName\": \"nominee-email-index\",
                    \"KeySchema\": [{ \"AttributeName\":\"nomineeEmail\",\"KeyType\":\"HASH\" }],
                    \"Projection\":{ \"ProjectionType\":\"ALL\" }
                }
            }
        ]"
```


## Resources
- https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html
