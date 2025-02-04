'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function TransactionMonitor({ address, blockfrostKey }) {
  const [isMonitoring, setIsMonitoring] = useState(false)

  const startMonitoring = async () => {
    setIsMonitoring(true)
    try {
      const response = await fetch('/api/transactions-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, blockfrostKey }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      toast.success(result.message)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsMonitoring(false)
    }
  }

  return (
    <Button onClick={startMonitoring} disabled={isMonitoring} variant="outline">
      {isMonitoring ? 'Monitoring...' : 'Monitor Address'}
    </Button>
  )
}
