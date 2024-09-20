'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {  MapPin, Video, Image as ImageIcon } from "lucide-react"

export function SkateSpot() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "TonyHawk",
      content: "I'm at the Ashland skatepark if anyone wants to pull up!",
      timestamp: "2 hours ago",
      location: "Ashland Skatepark"
    },
    {
      id: 2,
      author: "LeticiaBufoni",
      content: "Anyone down to skate tmrw at Ashland skatepark?",
      timestamp: "5 hours ago",
      location: "Ashland Skatepark"
    },
    {
      id: 3,
      author: "NyjahHuston",
      content: "Just landed this new trick! Check it out:",
      timestamp: "1 day ago",
      media: "/placeholder.svg?height=300&width=400",
      mediaType: "video"
    }
  ])

  const [newPost, setNewPost] = useState({ content: "", location: "", media: "" })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const post = {
      id: posts.length + 1,
      author: "CurrentUser",
      content: newPost.content,
      timestamp: "Just now",
      location: newPost.location,
      media: newPost.media,
      mediaType: newPost.media.endsWith('.mp4') ? "video" : "image"
    }
    setPosts([post, ...posts])
    setNewPost({ content: "", location: "", media: "" })
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <header className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SkateSpot</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Post a Skate Update</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea 
              placeholder="What's happening in the skate world?" 
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              className="w-full"
            />
            <div className="flex space-x-2">
              <Input 
                placeholder="Location (optional)" 
                value={newPost.location}
                onChange={(e) => setNewPost({...newPost, location: e.target.value})}
              />
              <Input 
                placeholder="Media URL (optional)" 
                value={newPost.media}
                onChange={(e) => setNewPost({...newPost, media: e.target.value})}
              />
            </div>
            <Button type="submit">Post Update</Button>
          </form>
        </div>

        {posts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-start space-x-3">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${post.author}`} />
                <AvatarFallback>{post.author[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  @{post.author}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {post.timestamp}
                </p>
                <p className="mt-1 text-gray-800 dark:text-gray-200">
                  {post.content}
                </p>
                {post.location && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {post.location}
                  </p>
                )}
                {post.media && (
                  <div className="mt-2">
                    {post.mediaType === "video" ? (
                      <video src={post.media} controls className="w-full rounded-lg" />
                    ) : (
                      <img src={post.media} alt="Skate content" className="w-full rounded-lg" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}