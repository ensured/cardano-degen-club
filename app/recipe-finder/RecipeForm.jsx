"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import CardLink from "@/components/CardLink"
import SelectScrollable from "@/components/SelectScrollable"

const formSchema = z.object({
  searchQuery: z.string().min(2, {
    message: "search query must be at least 2 characters.",
  }),
})

export function RecipeForm({ recipes }) {
  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchQuery: "",
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values) {
    console.log(values)
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="searchQuery"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search Query</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>

        <div className="flex flex-col gap-1">
          <div className="container mt-1 flex">
            <div className="flex flex-row flex-wrap items-center justify-center gap-1">
              <Badge variant={"outline"} className="p-2">
                {recipes.count} results 🎉
              </Badge>
              {/*
              <div className="flex gap-1">
                 <div className="flex gap-2">
                  <Button onClick={handleNextPageBtn}>Next</Button>
                </div> 
              </div>*/}
            </div>
          </div>
          <div className={"flex flex-row flex-wrap justify-center gap-4"}>
            {recipes.hits.map((recipe) => (
              <Link
                target="_blank"
                key={recipe.recipe.shareAs}
                href={recipe.recipe.shareAs}
              >
                <CardLink recipe={recipe} />
              </Link>
            ))}
          </div>
          <br />
        </div>
      </Form>
    </>
  )
}
