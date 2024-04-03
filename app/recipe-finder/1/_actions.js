'use server'

export async function getData(formData) {
  const q = formData.get("searchQuery")
  console.log(q)
  const url = `https://api.edamam.com/api/recipes/v2?q=${q}&type=public&app_id=${process.env.APP_ID}&app_key=${process.env.APP_KEY}`
  const response = await fetch(url)
  const data = await response.json()
  const myData = {
    hits: data.hits,
    count: data.count,
    nextPage: data._links.next?.href || "",
  }
  return myData
}

export async function getNextPage(url) {
  const response = await fetch(url)
  const data = await response.json()
  return data
}
