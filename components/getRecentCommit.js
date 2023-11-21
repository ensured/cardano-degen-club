import { Octokit } from "@octokit/core"

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

// query a speficic repo for recent commit
export default async function getRecentCommit(repo) {
  const response = await octokit.request("GET /repos/{owner}/{repo}/commits", {
    owner: "ensured",
    repo,
  })
  const sha = response.data[0].sha
  return sha
}
