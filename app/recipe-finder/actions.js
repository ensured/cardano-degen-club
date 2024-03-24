"use server";

export const fetchData = async (searchQuery) => {
  const url = `https://api.edamam.com/api/recipes/v2?q=${searchQuery}&type=public&app_id=${process.env.APP_ID}&app_key=${process.env.APP_KEY}`
  try {
    const response = await fetch(url)
    const data = await response.json()
    return data
  } catch (err) {
    console.error(err)
    return {
      error: err
    }
  }
}
