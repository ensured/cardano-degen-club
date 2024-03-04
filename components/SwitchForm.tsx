"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"

import { Switch } from "../components/ui/switch"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

const FormSchema = z.object({
  marketing_emails: z.boolean().default(false).optional(),
  security_emails: z.boolean(),
})

const SwitchForm = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      security_emails: true,
    },
  })

  const [convertToADA, setConvertToADA] = useState(true)
  const [amount, setAmount] = useState(1)

  const adaToBtcConversionRate = 0.00002
  const adaToSatsConversionRate = 1000000
  const adaToLovelacesConversionRate = 100000

  const btcToAdaConversionRate = 1 / adaToBtcConversionRate

  const convertToBTC = () => {
    const btcAmount = amount * adaToBtcConversionRate
    return btcAmount.toLocaleString()
  }

  const convertToSats = () => {
    const satsAmount = amount * adaToSatsConversionRate
    return satsAmount.toLocaleString()
  }

  const convertToLovelaces = () => {
    const lovelacesAmount = amount * adaToLovelacesConversionRate
    return lovelacesAmount.toLocaleString()
  }

  const convertToADAFromBTC = () => {
    const adaAmount = amount * btcToAdaConversionRate
    return adaAmount.toLocaleString()
  }

  const onSubmit = (data: any) => {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        {/* <div>
          <h3 className="mb-4 text-lg font-medium">Email Notifications</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="marketing_emails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Marketing emails
                    </FormLabel>
                    <FormDescription>
                      Receive emails about new products, features, and more.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="security_emails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Security emails</FormLabel>
                    <FormDescription>
                      Receive emails about your account security.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled
                      aria-readonly
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div> */}

        <div className="flex flex-col gap-2">
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />

          <Label className="flex items-center gap-2">
            <FormLabel htmlFor="amount" className="text-sm font-medium">
              Enter {convertToADA ? "ADA" : "BTC"} amount:
            </FormLabel>
            <Switch
              checked={convertToADA}
              onCheckedChange={() => setConvertToADA(!convertToADA)}
            />
          </Label>

          {convertToADA ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm dark:text-gray-300">
                {amount} ADA is equal to {convertToBTC()} BTC.
              </p>
              <p className="text-sm dark:text-gray-300">
                {amount} ADA is equal to {convertToSats()} SATs.
              </p>
              <p className="text-sm dark:text-gray-300">
                {amount} ADA is equal to {convertToLovelaces()} lovelaces.
              </p>
            </div>
          ) : (
            <p className="text-sm dark:text-gray-300">
              {amount} BTC is equal to {convertToADAFromBTC()} ADA.
            </p>
          )}
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

export default SwitchForm
