import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <>
      <div className=" bg-gray-100 shdc-hero py-20 md:py-24">
        <div className="container px-4">
          <div className="grid gap-10 items-center md:grid-cols-2 lg:gap-16">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to get started?
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Let's talk! Fill out the form below and we'll get back to you as
                soon as we can.
              </p>
            </div>
            <div className="space-y-4">
              <div className="max-w-lg space-y-2">
                <label
                  className="block text-sm font-medium tracking-wide"
                  htmlFor="hero-email"
                >
                  Email
                </label>
                <input
                  className="w-full form-input"
                  id="hero-email"
                  placeholder="john@example.com"
                  type="email"
                />
              </div>
              <div className="max-w-lg space-y-2">
                <label
                  className="block text-sm font-medium tracking-wide"
                  htmlFor="hero-message"
                >
                  Message
                </label>
                <textarea
                  className="w-full form-textarea"
                  id="hero-message"
                  placeholder="Enter your message here."
                  rows="3"
                />
              </div>
              <div className="w-full mt-4">
                <Button className="w-full">Submit</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
