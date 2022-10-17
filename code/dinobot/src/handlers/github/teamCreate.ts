import { HandlerFunction } from "@octokit/webhooks/dist-types/types";

export const teamCreatedHandler: HandlerFunction<"team.created", unknown> = async (event) => {
   console.log(event.payload.team.name)
}
