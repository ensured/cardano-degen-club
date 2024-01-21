"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "./ui/button"
import { Input } from "./ui/input"

const SearchRecipes = () => {
  const [loading, setLoading] = useState(true)
  const [recipes, setRecipes] = useState({})
  const [nextPage, setNextPage] = useState("")
  const [input, setInput] = useState("")
  const [fetchUrl, setFetchUrl] = useState(
    `https://api.edamam.com/api/recipes/v2?q=${input}&type=public&app_id=${process.env.APP_ID}&app_key=${process.env.APP_KEY}`
  )

  const searchRecipes = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(fetchUrl)
      const data = await response.json()
      setRecipes(data)
      setNextPage(data._links.next.href)
    } catch (err) {
      console.log(err)
    }
  }

  const handleNextPageBtn = async () => {
    if (nextPage) {
      try {
        const response = await fetch(nextPage)
        const data = await response.json()
        setRecipes(data)
        setNextPage(data._links.next.href)
      } catch (error) {
        console.log(error)
      }
    }
  }

  const handleInputChange = (e) => {
    setFetchUrl((prevFetchUrl) =>
      prevFetchUrl.replace(`q=${input}`, `q=${e.target.value}`)
    )
    setInput(e.target.value)
  }

  return (
    <div>
      <form onSubmit={searchRecipes} className="flex gap-2 px-2">
        <Input
          placeholder="search term"
          type="text"
          name="searchTerm"
          onChange={handleInputChange}
        />
        <Button type="submit">Search</Button>
      </form>
      {recipes.hits && recipes.hits.length > 0 ? (
        <div className="px-2">
          <p>found {recipes.count} recipes</p>

          {recipes.hits.map((recipe) => (
            <ul key={recipe.recipe.shareAs}>
              <Link href={recipe.recipe.shareAs} key={recipe.recipe}>
                {recipe.recipe.shareAs}
              </Link>
            </ul>
          ))}
          <div className="bg-slate-900 p-4">
            <Button onClick={handleNextPageBtn}>Next Page</Button>
          </div>
        </div>
      ) : (
        <p>No recipes found.</p>
      )}
    </div>
  )
}

export default SearchRecipes
