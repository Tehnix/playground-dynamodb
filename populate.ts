import AWS from "aws-sdk";

// Confignure the AWS client.
AWS.config.update({
  region: "eu-central-1",
});

// Set up a DynamoDB document client that we can interact with.
const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
});

const exampleData = [
  {
    pk: "3d79b92812b46635a6ad15a6923213022f470a62b18608d1f993df9b518aad78",
    sk: "nomineeProfile",
    firstName: "John",
    hashName: "john-doe",
    lastName: "Doe",
    nomineeEmail: "xx@example.org.uk",
    s3Object:
      "childrens-champion-campaign-2021-bucket/3d79b92812b46635a6ad15a6923213022f470a62b18608d1f993df9b518aad78",
    submissionId: "20211231T143954932Z",
    timestamp: "2021-12-31T14:40:11.004Z",
    votes: 0,
    zapierHookId: "61cf164c-a2f2-4faf-8067-d4080a1e0750",
  },
  {
    pk: "3d79b92812b46635a6ad15a6923213022f470a62b18608d1f993df9b518aad78",
    sk: "nomineeProfile#story",
    firstName: "John",
    hashName: "john-doe",
    lastName: "Doe",
    nomineeEmail: "xx@example.org.uk",
    s3Object:
      "childrens-champion-campaign-2021-bucket/3d79b92812b46635a6ad15a6923213022f470a62b18608d1f993df9b518aad78",
    submissionId: "20211231T143954932Z",
    timestamp: "2021-12-31T14:40:11.004Z",
    story: "test",
    votes: 0,
    zapierHookId: "61cf164c-a2f2-4faf-8067-d4080a1e0750",
  },
  {
    pk: "5a1590a74502cdfec74a34cd690eb75d07ad822804f9e346f562138187665f25",
    sk: "nomineeProfile",
    closingVoteDate: "2022-02-17T00:00:00.000Z",
    firstName: "Jen",
    hashName: "jen-doe",
    lastName: "Doe",
    nomineeEmail: "222222@gmail.com",
    s3Object:
      "childrens-champion-campaign-2021-bucket/5a1590a74502cdfec74a34cd690eb75d07ad822804f9e346f562138187665f25",
    submissionId: "20220129T220232795Z",
    timestamp: "2022-01-29T22:02:45.197Z",
    votes: 2,
    zapierHookId: "61f5b985-ae4e-4b91-bf0e-591931603340",
    version: 1,
  },
];

const main = async () => {
  console.log("Populating DynamoDB table...");

  // Populate the Tables with our example data.
  try {
    await Promise.all(
      exampleData.map(async (item) =>
        ddb
          .put({
            TableName: "study-club-session",
            Item: item,
            // Use a condition expression to ensure we do not overwrite any records.
            ConditionExpression: "attribute_not_exists(pk)",
          })
          .promise()
      )
    );
    console.log("Done populating the data!");
  } catch (err: any) {
    console.error(err);
    if (err.code === "ConditionalCheckFailedException") {
      console.log(
        "We've already set up the data, so this error is expected. Remove the ConditionExpression to overwrite the data."
      );
    } else {
      console.log(
        "Something unexpected happened, check the error above for more details."
      );
    }
  }

  // We'll now try to update a specific record. We use a version field to be able to ensure that
  // we're not overwriting any other changes. This means that a second run would be expected to
  // throw a ConditionalCheckFailedException.
  try {
    await ddb
      .update({
        TableName: "study-club-session",
        Key: {
          pk: "5a1590a74502cdfec74a34cd690eb75d07ad822804f9e346f562138187665f25",
          sk: "nomineeProfile",
        },
        UpdateExpression: "SET firstName = :val ADD version :incr",
        ConditionExpression: "version = :version",
        ExpressionAttributeValues: {
          ":val": "Johnny",
          ":version": 1,
          ":incr": 1,
        },
      })
      .promise();
    console.log("Done updating the item!");
  } catch (err: any) {
    console.error(err);
    if (err.code === "ConditionalCheckFailedException") {
      console.log(
        "We've already updated the data and version field, so this error is expected. Adjust the ConditionExpression to overwrite the data."
      );
    } else {
      console.log(
        "Something unexpected happened, check the error above for more details."
      );
    }
  }

  // Finally, we'll try to make a transaction that'll fail if we have already run it.
  try {
    await ddb
      .transactWrite({
        TransactItems: [
          {
            // Update the updatedAt attribute if it does not exist.
            Update: {
              TableName: "study-club-session",
              Key: {
                pk: "5a1590a74502cdfec74a34cd690eb75d07ad822804f9e346f562138187665f25",
                sk: "nomineeProfile",
              },
              UpdateExpression: "SET #updatedAt = :val",
              ConditionExpression: "attribute_not_exists(#updatedAt)",
              ExpressionAttributeNames: {
                "#updatedAt": "updatedAt",
              },
              ExpressionAttributeValues: {
                ":val": "2022-10-17T00:00:00.000Z",
              },
            },
          },
          {
            // Update the counter of the version number by incrementing it atomically.
            Update: {
              TableName: "study-club-session",
              Key: {
                pk: "3d79b92812b46635a6ad15a6923213022f470a62b18608d1f993df9b518aad78",
                sk: "nomineeProfile",
              },
              UpdateExpression: "ADD #version :incrVersion",
              ExpressionAttributeNames: {
                "#version": "version",
              },
              ExpressionAttributeValues: {
                ":incrVersion": 1,
              },
            },
          },
        ],
      })
      .promise();
    console.log("Done updating via a transaction!");
  } catch (err: any) {
    console.error(err);
    if (err.code === "TransactionCanceledException") {
      console.log(
        "We've already run the transaction, so this error is expected. Adjust the ConditionExpression to overwrite the data."
      );
    } else {
      console.log(
        "Something unexpected happened, check the error above for more details."
      );
    }
  }
};

main()
  .then(() => {})
  .catch((err) => console.error(err));
