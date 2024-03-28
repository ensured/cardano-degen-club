import FeedBackDrawer from "./Feedback"

const Footer = () => {
  return (
    <footer className="rounded-md bg-sky-200/70 shadow dark:bg-gray-900">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between gap-4 p-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          <div className=" flex flex-col items-center justify-center gap-x-1 sm:flex-row">
            <div>© 2024</div>{" "}
            <div className=" text-sm text-gray-500 hover:underline dark:text-gray-400">
              cardanodegen.club
            </div>
          </div>
        </span>
        <ul className="flex flex-nowrap items-center justify-center">
          {/* <li>
            <a href="#" className="me-4 hover:underline md:me-6">
              About
            </a>
          </li> */}
          {/* <li>
            <a href="#" className="me-4 hover:underline md:me-6">
              Privacy Policy
            </a>
          </li> */}
          <li>
            <FeedBackDrawer />
          </li>
        </ul>
      </div>
    </footer>
  )
}

export default Footer
