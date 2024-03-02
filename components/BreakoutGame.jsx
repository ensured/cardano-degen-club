"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

const BreakoutGame = () => {
  const canvasRef = useRef(null)
  const ballX = useRef(50)
  const ballY = useRef(50)
  const ballDX = useRef(4)
  const ballDY = useRef(4)
  const paddleX = useRef(350)
  const paddleWidth = 100
  const paddleHeight = 15
  const blockWidth = 50
  const blockHeight = 20
  const numBlocksX = 30
  const numBlocksY = 16
  const blocksRef = useRef([])
  const [gameOver, setGameOver] = useState(false)
  const [isDesktopView, setIsDesktopView] = useState(true)
  const scoreRef = useRef(0)

  useEffect(() => {
    const windowWidth = window.innerWidth < 768
    if (windowWidth) {
      setIsDesktopView(windowWidth)
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let requestId

    const initializeGame = () => {
      ballX.current = 50
      ballY.current = 50
      ballDX.current = 2
      ballDY.current = 4
      paddleX.current = 350
      setGameOver(false)
      initializeBlocks()
      scoreRef.current = 0
    }

    const initializeBlocks = () => {
      blocksRef.current = []
      const topPadding = 50 // Adjust this value to control the distance from the top
      for (let row = 0; row < numBlocksY; row++) {
        for (let col = 0; col < numBlocksX; col++) {
          blocksRef.current.push({
            x: col * blockWidth,
            y: topPadding + row * blockHeight, // Add topPadding here
            width: blockWidth,
            height: blockHeight,
          })
        }
      }
    }

    const drawBlocks = () => {
      ctx.fillStyle = "#00bcd4"
      blocksRef.current.forEach((block) => {
        ctx.fillRect(block.x, block.y, block.width, block.height)
        ctx.strokeStyle = "#fff"
        ctx.strokeRect(block.x, block.y, block.width, block.height)
      })
    }

    const drawScore = () => {
      ctx.fillStyle = "springgreen"
      ctx.font = "20px Arial"
      ctx.fillText(`Score: ${scoreRef.current}`, 5, 20)
    }

    const resetGame = () => {
      // Clear any ongoing animations or toast messages
      cancelAnimationFrame(requestId)
      toast.dismiss() // Dismiss any ongoing toasts

      // Reset ball and paddle positions
      ballX.current = 50
      ballY.current = 50
      ballDX.current = 4
      ballDY.current = 8
      paddleX.current = 350

      // Reset game over status and other relevant state
      setGameOver(false)

      // Reset block positions
      initializeBlocks()
      scoreRef.current = 0
      drawBlocks()

      // Restart the game loop
      requestId = requestAnimationFrame(updateGame)
    }

    const resizeCanvas = () => {
      const navbarHeight = 64 // Adjust this value according to your actual navbar height
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight - navbarHeight // Adjust canvas height considering the navbar
    }

    const drawPaddle = () => {
      ctx.fillStyle = "#cccccc"
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
      drawBlocks()
      drawScore()

      ballX.current += ballDX.current
      ballY.current += ballDY.current

      // Collision with left and right walls
      if (
        ballX.current + ballDX.current > canvas.width - 10 ||
        ballX.current + ballDX.current < 10
      ) {
        ballDX.current = -ballDX.current
      }

      // Collision with top wall
      if (ballY.current + ballDY.current < 10) {
        ballDY.current = -ballDY.current
      }

      // Collision with bottom wall (game over)
      if (ballY.current + ballDY.current > canvas.height - 10) {
        cancelAnimationFrame(requestId)
        setGameOver(true)
        toast.error("You lost!")
        resetGame()
        return
      }

      // Collision with paddle
      if (
        ballY.current + ballDY.current > canvas.height - 10 - paddleHeight &&
        ballX.current > paddleX.current &&
        ballX.current < paddleX.current + paddleWidth
      ) {
        const paddleCenter = paddleX.current + paddleWidth / 2
        const collisionPoint = ballX.current - paddleCenter

        // Adjust ballDX based on collision point
        const maxBounceAngle = Math.PI / 3 // Adjust the maximum bounce angle
        const normalizedCollisionPoint = collisionPoint / (paddleWidth / 2)
        const bounceAngle = normalizedCollisionPoint * maxBounceAngle

        ballDY.current = -Math.abs(ballDY.current) // Ensure upward direction

        // Adjust ballDX based on collision point for extra bounce
        const extraBounceFactor = 1.5 // Adjust the extra bounce factor
        ballDX.current =
          -Math.sin(bounceAngle) * ballDY.current * extraBounceFactor
      }

      // Collision with blocks
      blocksRef.current.forEach((block, index) => {
        if (
          ballY.current - 10 < block.y + block.height &&
          ballY.current + 10 > block.y &&
          ballX.current - 10 > block.x &&
          ballX.current + 10 < block.x + block.width
        ) {
          ballDY.current = -ballDY.current
          blocksRef.current.splice(index, 1)
          scoreRef.current += 10

          if (blocksRef.current.length === 0) {
            // All blocks cleared
            toast.success("Congratulations! You win!")
            resetGame()
          }
        }
      })

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
    initializeGame()

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
        <canvas ref={canvasRef} />
      )}
    </>
  )
}

export default BreakoutGame
