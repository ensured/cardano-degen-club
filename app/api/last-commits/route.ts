import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

const GITHUB_API_URL = "https://api.github.com/repos"
const GITHUB_HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
}

const fetchJson = async (url: string) => {
  const response = await fetch(url, { headers: GITHUB_HEADERS })
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${url}`)
  }
  return response.json()
}

const fetchLatestRepoCommit = async ({
  owner,
  repo,
}: {
  owner: string
  repo: string
}) => {
  const url = `${GITHUB_API_URL}/${owner}/${repo}/commits`
  const commits = await fetchJson(url)
  return {
    repo: repo,
    message: commits[0]?.commit?.message,
    date: commits[0]?.commit?.committer?.date,
  }
}

const fetchFolderCommits = async ({
  owner,
  repo,
}: {
  owner: string
  repo: string
}) => {
  const url = `${GITHUB_API_URL}/${owner}/${repo}/contents/app`
  const folders = await fetchJson(url)

  return Promise.all(
    folders.map(async (folder: any) => {
      const commitUrl = `${GITHUB_API_URL}/${owner}/${repo}/commits?path=${folder.path}`
      const commits = await fetchJson(commitUrl)
      return {
        folder: folder.name,
        lastCommitDate: commits[0]?.commit?.committer?.date,
      }
    })
  )
}

export async function GET() {
  const repos = [
    { owner: "ensured", repo: "cardano-degen-club" },
    { owner: "ensured", repo: "phone-backup-app-android" },
  ]

  try {
    const folderCommits = await Promise.all(repos.map(fetchFolderCommits))
    const latestRepoCommit = await Promise.all(repos.map(fetchLatestRepoCommit))
    console.log(latestRepoCommit[0])

    return NextResponse.json({ folderCommits, latestRepoCommit })
  } catch (error: any) {
    console.error("Error fetching commits:", error.message)
    return NextResponse.json(
      { error: "Failed to fetch commit messages." },
      { status: 500 }
    )
  }
}
