import { HTTPResponse } from "../Global/DTO";
import { ddbDocClient } from "../Global/DynamoDB";
import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda"
import User from "../Global/User";
import { userAgentMiddleware } from "@aws-sdk/middleware-user-agent";
import { type } from "os";


export const handler = async (event: APIGatewayProxyEvent): Promise<HTTPResponse> => {
    // Your code here

    if (event.body != null) {

        const body = event.body;
        const user: any = JSON.parse(body);
        const updatedUser: User = new User(user);
        updatedUser.userName = user.dataKey;

        console.log(updatedUser);
        const params: UpdateCommandInput = {
            TableName: process.env.DDB_TABLE_NAME,
            Key: {
                dataType: "user",
                dataKey: updatedUser.userName
            },
            ExpressionAttributeValues: {
                ":d": updatedUser.displayName,
                ":e": updatedUser.email,
                ":i": updatedUser.profileImg
            },
            UpdateExpression: "SET displayName = :d, email = :e, profileImg = :i",
            ReturnValues: "ALL_NEW"
        }
        try {
            const data = await ddbDocClient.send(new UpdateCommand(params));

            return new HTTPResponse(200, data.Attributes);
        } catch (err) {
            throw (err);
        }
    }
    else return new HTTPResponse(400, "request body was null")
}
