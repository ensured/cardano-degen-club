export const dynamic = "force-dynamic" // defaults to autoexport async function GET() {

export async function GET() {
  const res = await fetch("https://data.mongodb-api.com/...", {
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data = await res.json()

  return Response.json({ data })
}
