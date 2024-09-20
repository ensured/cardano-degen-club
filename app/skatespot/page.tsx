"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Video, Image as ImageIcon } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function SkateSpot() {
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
      mediaType: "video",
      location: ""
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
    <div className="min-h-screen bg-gray-100 p-4 dark:bg-gray-900">
      <header className="mx-auto mb-8 max-w-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SkateSpot</h1>
          </div>
          {/* DialogTrigger to open modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button>Post Update</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post a Skate Update</DialogTitle>
              </DialogHeader>
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
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="secondary">Cancel</Button>
                  <Button type="submit">Post Update</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="flex items-start space-x-3">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${post.author}`} />
                <AvatarFallback>{post.author[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
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
                  <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="mr-1 size-4" />
                    {post.location}
                  </p>
                )}
                {post.media && (
                  <div className="mt-2">
                    {post.mediaType === "video" ? (
                      <video src={post.media} controls className="w-full rounded-lg" />
                    ) : (
                      <Image src={post.media} alt="Skate content" className="w-full rounded-lg" />
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
