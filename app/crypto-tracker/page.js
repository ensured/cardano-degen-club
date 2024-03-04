"use client";
import { useState } from "react";
import TradingViewChart from "../../components/TradingViewChart";

const Crypto = () => {
  const [amount, setAmount] = useState(1);
  const [convertToADA, setConvertToADA] = useState(true);

  // Example conversion rates
  const adaToBtcConversionRate = 0.00002; // Example conversion rate from ADA to BTC
  const adaToSatsConversionRate = 1000000; // Example conversion rate from ADA to SATs
  const adaToLovelacesConversionRate = 100000; // Example conversion rate from ADA to lovelaces

  const btcToAdaConversionRate = 1 / adaToBtcConversionRate; // Conversion rate from BTC to ADA

  const convertToBTC = () => {
    const btcAmount = amount * adaToBtcConversionRate;
    return btcAmount.toLocaleString(); // Format the result for easy reading
  };

  const convertToSats = () => {
    const satsAmount = amount * adaToSatsConversionRate;
    return satsAmount.toLocaleString(); // Format the result for easy reading
  };

  const convertToLovelaces = () => {
    const lovelacesAmount = amount * adaToLovelacesConversionRate;
    return lovelacesAmount.toLocaleString(); // Format the result for easy reading
  };

  const convertToADAFromBTC = () => {
    const adaAmount = amount * btcToAdaConversionRate;
    return adaAmount.toLocaleString(); // Format the result for easy reading
  };

  return (
    <div className="px-2 flex flex-col justify-center items-center">
      <TradingViewChart />

      <div className="flex flex-col gap-2">
        <label htmlFor="amount" className="text-sm font-medium">
          Enter {convertToADA ? "ADA" : "BTC"} amount:
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={convertToADA}
            onChange={() => setConvertToADA(!convertToADA)}
            className="accent-sky-500 focus:ring-0"
          />
          <span className="text-sm font-medium dark:text-gray-300">Convert to ADA</span>
        </label>

        {convertToADA && (
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
        )}

        {!convertToADA && (
          <p className="text-sm dark:text-gray-300">
            {amount} BTC is equal to {convertToADAFromBTC()} ADA.
          </p>
        )}
      </div>
    </div>
  );
};

export default Crypto;

