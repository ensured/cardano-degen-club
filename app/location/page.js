"use client";
import { useEffect, useState } from "react";
import toast from "sonner";

const Page = () => {
  const [weather, setWeather] = useState({
    lat: "",
    lon: "",
    city: "",
    state: "",
    zip: ""
  });

  useEffect(() => {
    function getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, handleError);
      } else {
        toast.error("Geolocation is not supported by this browser.");
      }
    }

    function showPosition(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setWeather({ lat, lon });

      fetchCityStateZip(lat, lon);
    }

    function handleError(error) {
      console.error("Error getting geolocation:", error);
      toast.error("Error getting geolocation. Please try again later.");
    }

    async function fetchCityStateZip(lat, lon) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        const address = data.address;
        const city = address.city || address.town || address.village || "";
        const state = address.state || address.county || "";
        const zip = address.postcode || "";
        setWeather((prevWeather) => ({ ...prevWeather, city, state, zip }));
      } catch (error) {
        console.error("Error fetching city/state/zip data:", error);
        toast.error("Error fetching city/state/zip data. Please try again later.");
      }
    }

    getLocation();
  }, []);

  return (
    <div>
      <div>
        {weather && (
          <div className="mx-12 mt-6 flex flex-col items-center justify-center rounded-sm border border-dashed border-green bg-slate-200/40 p-6 shadow-lg dark:bg-slate-900/30 dark:shadow-slate-800">
            <h1>Latitude: {weather.lat}</h1>
            <h1>Longitude: {weather.lon}</h1>
            <h1>City: {weather.city}</h1>
            <h1>State: {weather.state}</h1>
            <h1>Zip Code: {weather.zip}</h1></div>
        )}
      </div>
      {/* <ProfileForm /> */}
    </div>
  );
};

export default Page;
