import FeedBackDrawer from "./Feedback"

const Footer = () => {
  return (
    <footer className="bg-sky-200/70 shadow dark:bg-zinc-900">
      <div className="flex w-full items-center justify-between gap-4 p-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          <div className=" flex flex-col items-center justify-center gap-x-1 sm:flex-row">
            <div>© 2024</div>{" "}
            <div className=" text-sm text-gray-500 hover:underline dark:text-gray-400">
              cardanodegen.club
            </div>
          </div>
        </span>
        <FeedBackDrawer />
      </div>
    </footer>
  )
}

export default Footer
