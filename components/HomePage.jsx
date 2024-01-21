"use client"

import CardForm from "@/components/CardForm"

// import Feedback from "../components/Feedback"

const HomePage = () => {
  return (
    <div className="mt-8">
      <CardForm />
      {/* <Feedback /> */}

      {/* <div className="p-6 rounded-sm">
        <h3 style={{ fontFamily: "monospace" }} />
        <pre
          style={{
            background: "#f6f8fa",
            fontSize: ".65rem",
            padding: ".5rem",
            color: "black",
          }}
        >
          <strong>props</strong> = {JSON.stringify(commits, null, 2)}
        </pre>
      </div> */}

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
