import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, res: NextResponse) {
  const searchParams = req.nextUrl.searchParams
  const ip = searchParams.get("ip")
  const port = searchParams.get("port")

  if (!ip) {
    return NextResponse.json({
      status: 400,
      message: "Please provide a IP address",
    })
  } else if (!port) {
    return NextResponse.json({
      status: 400,
      message: "Please provide a port number",
    })
  }

  // Validate input (IP address and port number)
  if (!isValidIp(ip)) {
    return NextResponse.json({
      status: 400,
      message: "Invalid IP",
    })
  } else if (!isValidPort(port)) {
    return NextResponse.json({
      status: 400,
      message: "Invalid port",
    })
  }

  try {
    const net = require("net")

    const promise = new Promise((resolve, reject) => {
      const socket = new net.Socket()
      socket.setTimeout(5000) // Set timeout for connection attempt
      socket.on("connect", () => {
        socket.end()
        resolve(true) // Port is open
      })
      socket.on("error", (err: Error) => {
        if (err.message.includes("ECONNREFUSED")) {
          resolve(false) // Port is closed
        } else {
          reject(err) // Other error occurred
        }
      })
      socket.on("timeout", () => {
        reject("Connection timed out") // Timeout occurred
      })
      socket.connect(parseInt(port, 10), ip) // Connect to the specified port
    })

    const isOpen = await promise
    return NextResponse.json({
      status: 200,
      message: isOpen ? "Port is open" : "Port is closed",
    })
  } catch (err) {
    return NextResponse.json({
      status: 500,
      message: err,
    })
  }
}

function isValidIp(ip: string): boolean {
  const regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return regex.test(ip)
}

function isValidPort(port: string): boolean {
  const number = parseInt(port, 10)
  return !isNaN(number) && number >= 0 && number <= 65535
}
