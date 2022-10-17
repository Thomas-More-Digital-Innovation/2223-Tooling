import { Octokit } from "@octokit/rest";

export const getGitHubClient = (token: string) => new Octokit({
    auth: token,
    userAgent: "DigitalInnovationTooling v1.0.0"
});
