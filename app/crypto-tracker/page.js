"use client";
import { useState } from "react";
import TradingViewChart from "../../components/TradingViewChart";

const Crypto = () => {
  const [adaAmount, setAdaAmount] = useState(1);

  // Example conversion rates
  const adaToBtcConversionRate = 0.00002; // Example conversion rate from ADA to BTC
  const adaToSatsConversionRate = 1000000; // Example conversion rate from ADA to SATs
  const adaToLovelacesConversionRate = 100000; // Example conversion rate from ADA to lovelaces

  const convertToBTC = () => {
    const btcAmount = adaAmount * adaToBtcConversionRate;
    return btcAmount.toLocaleString(); // Format the result for easy reading
  };

  const convertToSats = () => {
    const satsAmount = adaAmount * adaToSatsConversionRate;
    return satsAmount.toLocaleString(); // Format the result for easy reading
  };

  const convertToLovelaces = () => {
    const lovelacesAmount = adaAmount * adaToLovelacesConversionRate;
    return lovelacesAmount.toLocaleString(); // Format the result for easy reading
  };

  return (
    <div className="px-2 flex flex-col justify-center items-center">
      <TradingViewChart />

      <div>
        <label>Enter ADA amount:</label>
        <input
          type="number"
          value={adaAmount}
          onChange={(e) => setAdaAmount(e.target.value)}
        />

        <p>
          {adaAmount} ADA is equal to {convertToBTC()} BTC.
        </p>
        <p>
          {adaAmount} ADA is equal to {convertToSats()} SATs.
        </p>
        <p>
          {adaAmount} ADA is equal to {convertToLovelaces()} lovelaces.
        </p>
      </div>
    </div>
  );
};

export default Crypto;
