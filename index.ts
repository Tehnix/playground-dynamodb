import AWS from "aws-sdk";

// Confignure the AWS client.
AWS.config.update({
  region: "eu-central-1",
});

// Set up a DynamoDB document client that we can interact with.
const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
});

const main = async () => {
  // An example of how to get a single item from a Table.
  const item = await ddb
    .get({
      TableName: "study-club-session",
      Key: {
        pk: "3d79b92812b46635a6ad15a6923213022f470a62b18608d1f993df9b518aad78",
        sk: "nomineeProfile",
      },
    })
    .promise();
  console.log("Found the following item:");
  console.log(item);

  // An example of how to query data from DynamoDB.
  const items = await ddb
    .query({
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
    .promise();
  console.log("Found the following items:");
  console.log(items);
};

main()
  .then(() => {})
  .catch((err) => console.error(err));
