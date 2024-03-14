// some client component

"use client"

import { useEffect, useState } from "react"

export default function UploadProfilePic() {
  const [user, setUser] = useState()
  const [authStatus, setAuthStatus] = useState(null)

  console.log(user)

  useEffect(() => {
    const getKindeSession = async () => {
      const res = await fetch("/api/kindeSession")
      const data = await res.json()
      setUser(data.user)
      setAuthStatus(data.authenticated)
    }

    getKindeSession()
  }, [])

  return (
    <div>
      <h1>Upload Profile Picture</h1>
      {authStatus ? "authenticated" : "not authenticated"}
    </div>
  )
}
