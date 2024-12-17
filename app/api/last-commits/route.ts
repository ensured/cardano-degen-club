import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function GET() {
    const githubToken = process.env.GITHUB_TOKEN; // Store in .env.local
    const repos = [
      { 
        owner: "ensured", 
        repo: "cardano-degen-club", 
      },
      { owner: "ensured", 
      repo: "phone-backup-app-android"
    },
    ];
  
    try {
      const fetchLatestCommitDate = async ({ owner, repo }: { owner: string; repo: string }) => {
        const url = `https://api.github.com/repos/${owner}/${repo}/commits`; // Fetch repo contents
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
        const commits = await response.json();
        return {
          repo: repo,
          message: commits[0]?.commit?.message,
          date: commits[0]?.commit?.committer?.date,
        };
      }

      const fetchFolderCommits = async ({ owner, repo }: { owner: string; repo: string }) => {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/app`; // Fetch repo contents
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
          cache: "no-store", // Prevent caching
        });
  
        if (!response.ok) {
          throw new Error(`Failed to fetch contents for ${repo}`);
        }
  
        const folders = await response.json();
        const folderCommits = await Promise.all(folders.map(async (folder: any) => {
          const commitUrl = `https://api.github.com/repos/${owner}/${repo}/commits?path=${folder.path}`; // Get commits for each folder
          const commitResponse = await fetch(commitUrl, {
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          });
          if (!commitResponse.ok) {
            throw new Error(`Failed to fetch commits for folder ${folder.path}`);
          }
          const commits = await commitResponse.json();
          return { folder: folder.name, lastCommitDate: commits[0]?.commit?.committer?.date }; // Get last commit date
        }));

        return folderCommits;
      };

      const commits = await Promise.all(repos.map(fetchFolderCommits));

      const latestCommitDates = await Promise.all(repos.map(fetchLatestCommitDate));

      return NextResponse.json({ commits: commits, latestCommitDates: latestCommitDates });
    } catch (error: any) {
      console.error("Error fetching commits:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch commit messages." },
        { status: 500 }
      );
    }
  }
  