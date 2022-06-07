import { DynamoDB } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

// Set up a DynamoDB document client that we can interact with.
const ddbClient = new DynamoDB({
  apiVersion: "2012-08-10",
  region: "eu-central-1",
});
const client = DynamoDBDocumentClient.from(ddbClient);

const main = async () => {
  // An example of how to get a single item from a Table.
  const item = await client.send(
    new GetCommand({
      TableName: "study-club-session",
      Key: {
        pk: "3d79b92812b46635a6ad15a6923213022f470a62b18608d1f993df9b518aad78",
        sk: "nomineeProfile",
      },
    })
  );
  console.log("Found the following item:");
  console.log(item);

  // An example of how to query data from DynamoDB.
  const items = await client.send(
    new QueryCommand({
      TableName: "study-club-session",
      KeyConditionExpression: "#pk = :pk",
      ExpressionAttributeNames: {
        "#pk": "pk",
      },
      ExpressionAttributeValues: {
        ":pk":
          "5a1590a74502cdfec74a34cd690eb75d07ad822804f9e346f562138187665f25",
      },
    })
  );
  console.log("Found the following items:");
  console.log(items);
};

main()
  .then(() => {})
  .catch((err) => console.error(err));
