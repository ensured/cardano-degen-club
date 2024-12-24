import { headers } from "next/headers"

import PortForwardChecker from "./PortForwardChecker"

export const metadata = {
  title: "Port Checker",
}

const page = () => {
  const headerList = headers()
  const usersIp = headerList.get("x-forwarded-for")
  return <PortForwardChecker usersIp={usersIp} />
}

export default page
