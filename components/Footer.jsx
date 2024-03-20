import FeedBackDrawer from "./Feedback"

const Footer = () => {
  return (
    <footer className="mx-2 mb-1 mt-7 rounded-md bg-white shadow dark:bg-gray-800">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between gap-4 p-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          <span className="flex flex-col items-center justify-center gap-x-4 md:flex-row">
            <span>© 2024</span>
            <span className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              cardanodegen.club
            </span>
          </span>{" "}
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
