"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Icons } from "@/components/icons"

const SATOSHIS_PER_BITCOIN = 1e8
const adaPriceApiUrl =
  "https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd"
const btcPriceApiUrl =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"

const ConvertAda = () => {
  const [cryptoPrices, setCryptoPrices] = useState({
    ADA: 0,
    BTC: 0,
  })

  const [currency, setCurrency] = useState("ADA")
  const [amount, setAmount] = useState(1)

  const handleSwitchChange = () => {
    setCurrency((prevCurrency) => (prevCurrency === "ADA" ? "BTC" : "ADA"))
  }

  const handleAmountChange = (event) => {
    const newAmount = event.target.value.toString()
    setAmount(
      isNaN(newAmount)
        ? ""
        : newAmount.length > 20
        ? newAmount.slice(0, 20)
        : newAmount
    )
  }

  const convertToLovelaces = (amount, conversionRate) => {
    return Math.floor(amount * conversionRate)
  }

  const convertToSats = (amount, conversionRate) => {
    return Math.floor(amount * conversionRate * 1e8)
  }

  const fetchCryptoPrices = useCallback(async () => {
    try {
      const [adaRes, btcRes] = await Promise.all([
        fetch(adaPriceApiUrl).then((res) => res.json()),
        fetch(btcPriceApiUrl).then((res) => res.json()),
      ])

      setCryptoPrices({
        ADA: adaRes.cardano.usd,
        BTC: btcRes.bitcoin.usd,
      })
    } catch (error) {
      let errorMessage = `${error.message}. Coingecko api down?`
      if (error.response && error.response.status) {
        toast(`${errorMessage} Status code: ${error.response.status}`, {
          type: "error",
        })
      }
      toast(errorMessage, {
        type: "error",
      })
      console.error("Error fetching prices:", error)
    }
  }, [])

  useEffect(() => {
    const fetchPricesAndSetState = async () => {
      await fetchCryptoPrices()
    }

    // Fetch crypto prices initially
    fetchPricesAndSetState()

    // Fetch prices every minute
    const intervalId = setInterval(fetchPricesAndSetState, 60000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [fetchCryptoPrices])

  const convertedLovelaces =
    currency === "ADA" && convertToLovelaces(amount, 1000000).toLocaleString()

  const convertedADA =
    currency === "ADA"
      ? (amount * cryptoPrices.BTC * cryptoPrices.ADA).toLocaleString(
          undefined,
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )
      : (amount / (cryptoPrices.ADA / cryptoPrices.BTC)).toLocaleString(
          undefined,
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )

  const convertedSats =
    currency === "ADA"
      ? convertToSats(
          amount,
          cryptoPrices.BTC * cryptoPrices.ADA
        ).toLocaleString()
      : (amount * SATOSHIS_PER_BITCOIN).toLocaleString()

  const convertedBTC =
    currency === "ADA" && amount / (cryptoPrices.ADA * cryptoPrices.BTC)

  return (
    <div className=" container mt-4 flex h-52 flex-col">
      <div className="flex flex-row items-center gap-2">
        <Switch
          id="currency-switch"
          checked={currency === "ADA"}
          onCheckedChange={handleSwitchChange}
        />
        <Label htmlFor="currency-switch">
          <div className={"flex items-center justify-center gap-2"}>
            {" "}
            {currency}
          </div>
          {currency === "ADA" ? (
            <div className={cn(`${currency === "BTC" ? "p-0" : "px-2"}`)}>
              {cryptoPrices && <strong>${cryptoPrices.ADA.toFixed(4)}</strong>}
            </div>
          ) : (
            <div className="">
              {cryptoPrices && (
                <strong>
                  $
                  {cryptoPrices.BTC.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              )}
            </div>
          )}
        </Label>

        {currency === "ADA" ? (
          <Icons.ada className="h-32 w-32" />
        ) : (
          <Icons.btc className="h-32 w-32" />
        )}
        <Input
          type="number"
          min={"1"}
          max={"20"}
          value={amount}
          onChange={handleAmountChange}
          className=""
          placeholder={`Enter ${currency} amount`}
        />

        {amount.length >= 20 ? <div className="inline">Too long!</div> : ""}
      </div>

      <div className="flex flex-col break-all">
        {currency === "ADA" && cryptoPrices.BTC && (
          <div>
            BTC: {amount > 0 && <strong>{convertedBTC.toFixed(10)}</strong>}
          </div>
        )}

        {currency === "BTC" && (
          <div>ADA: {amount > 0 && <strong>{convertedADA}</strong>}</div>
        )}

        <p>Sats: {amount > 0 && <strong>{convertedSats}</strong>}</p>

        {currency === "ADA" && (
          <p>
            Lovelaces: {amount > 0 && <strong>{convertedLovelaces}</strong>}
          </p>
        )}
      </div>
    </div>
  )
}

export default ConvertAda
