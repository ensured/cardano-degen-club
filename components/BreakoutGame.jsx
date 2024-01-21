"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

const BreakoutGame = () => {
  const canvasRef = useRef(null)
  const ballX = useRef(50)
  const ballY = useRef(50)
  const ballDX = useRef(2)
  const ballDY = useRef(4)
  const paddleX = useRef(350) // Initial paddle position
  const paddleWidth = 100
  const paddleHeight = 15 // Adjusted paddle height
  const [gameOver, setGameOver] = useState(false)
  const [isDesktopView, setIsDesktopView] = useState(true)

  useEffect(() => {
    const windowWidth = window.innerWidth < 768
    if (windowWidth) {
      setIsDesktopView(windowWidth)
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let requestId

    const resetGame = () => {
      // Clear any ongoing animations or toast messages
      cancelAnimationFrame(requestId)
      toast.dismiss() // Dismiss any ongoing toasts

      // Reset ball and paddle positions
      ballX.current = 50
      ballY.current = 50
      ballDX.current = 2
      ballDY.current = 4
      paddleX.current = 350

      // Reset game over status and other relevant state
      setGameOver(false)

      // Restart the game loop
      requestId = requestAnimationFrame(updateGame)
    }

    const resizeCanvas = () => {
      const navbarHeight = 64 // Adjust this value according to your actual navbar height
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight - navbarHeight // Adjust canvas height considering the navbar
    }

    const drawPaddle = () => {
      ctx.fillStyle = "#dddddd"
      ctx.fillRect(
        paddleX.current,
        canvas.height - paddleHeight,
        paddleWidth,
        paddleHeight
      )
    }

    const drawBall = () => {
      ctx.beginPath()
      ctx.arc(ballX.current, ballY.current, 10, 0, Math.PI * 2)
      ctx.fillStyle = "red"
      ctx.fill()
      ctx.closePath()
    }

    const updateGame = () => {
      if (gameOver) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawPaddle()
      drawBall()

      ballX.current += ballDX.current
      ballY.current += ballDY.current

      if (
        ballX.current + ballDX.current > canvas.width ||
        ballX.current + ballDX.current < 0
      ) {
        ballDX.current = -ballDX.current
      }
      if (ballY.current + ballDY.current < 0) {
        ballDY.current = -ballDY.current
      } else if (ballY.current + ballDY.current > canvas.height - 10) {
        if (
          ballX.current > paddleX.current &&
          ballX.current < paddleX.current + paddleWidth
        ) {
          // Ball hits the paddle
          const collisionPoint =
            ballX.current - (paddleX.current + paddleWidth / 2)
          ballDY.current = -ballDY.current

          // Adjust ball horizontal speed based on collision point on the paddle
          ballDX.current = collisionPoint * 0.22

          // Add a temporary increase in ball speed
          ballDX.current *= 1.6

          // Limit the maximum speed gained from collision
          if (ballDX.current > 10) {
            ballDX.current = 10
          }
        } else {
          cancelAnimationFrame(requestId)
          setGameOver(true)
          toast.error("You lose :P")
          resetGame()
        }
      }

      requestId = requestAnimationFrame(updateGame)
    }

    resizeCanvas() // Initial canvas sizing

    updateGame()

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      paddleX.current = mouseX - paddleWidth / 2
      if (paddleX.current < 0) {
        paddleX.current = 0
      }
      if (paddleX.current + paddleWidth > canvas.width) {
        paddleX.current = canvas.width - paddleWidth
      }
    }

    document.addEventListener("mousemove", handleMouseMove)

    const handleResize = () => {
      setIsDesktopView(window.innerWidth > 768) // Set breakpoint as needed
      resizeCanvas() // Resize canvas on window resize
      resetGame() // Reset the game after resizing
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(requestId)
      document.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [gameOver])

  return (
    <>
      {!isDesktopView ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>
            <strong>This game is optimized for desktop view only. </strong>
            <br />
            <i>Try resizing.</i>
          </p>
        </div>
      ) : (
        <canvas ref={canvasRef} style={{ display: "block", padding: "2px" }} />
      )}
    </>
  )
}

export default BreakoutGame
