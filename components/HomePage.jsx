"use client"

// import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// import axios from "axios"

import CardForm from "@/components/CardForm"

const HomePage = () => {
  // const [commits, setCommits] = useState([])

  // const fetchCommits = async () => {
  //   try {
  //     // Replace 'username' and 'repo' with your GitHub username and repository name
  //     const response = await axios.get(
  //       "https://api.github.com/repos/ensured/punycode-unicode.converter/commits"
  //     )

  //     setCommits(response.data)
  //   } catch (error) {
  //     console.error("Error fetching commits:", error)
  //   }
  // }

  // useEffect(() => {
  //   fetchCommits()

  //   const interval = setInterval(() => {
  //     fetchCommits()
  //   }, 10000) // Fetch every 10 seconds

  //   return () => clearInterval(interval)
  // }, []) // Empty dependency array to run only on initial mount

  // useEffect(() => {})

  return (
    <div className="mt-8">
      <CardForm />
      {/* <div>
        <h2>Recent Commits</h2>
        <ul className="text-purple-500 text-sm">
          {commits.map((commit) => (
            <li key={commit.sha}>
              <strong>{commit.commit.author.name}</strong>:{" "}
              {commit.commit.message}
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  )
}

export default HomePage
