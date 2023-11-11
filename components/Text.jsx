import React from "react"

const Text = ({ text }) => {
  return (
    <div
      className="font-bold text-center mt-10 py-16
  flex flex-col justify-center items-center text-2xl"
    >
      {text}
    </div>
  )
}

export default Text
