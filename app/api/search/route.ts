import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/utils/rateLimiter";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const ip = await getClientIp();
  if (!ip) {
    return NextResponse.json({
      success: false,
      message: "Client IP address not found",
    });
  }

  const searchParams = request.nextUrl
    ? new URL(request.url).searchParams
    : null;

  // For paginated fetching without rate-limiting
  if (searchParams && searchParams.get("nextPage")) {
    const nextPageUrl = `${searchParams.get(
      "nextPage",
    )}&app_key=${searchParams.get("app_key")}&_cont=${searchParams.get(
      "_cont",
    )}&type=${searchParams.get("type")}&app_id=${searchParams.get("app_id")}`;

    try {
      const response = await fetch(nextPageUrl);
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: "An error occurred. Please try again later.",
      });
    }
  }

  // For regular fetching with rate-limiting
  const rateLimitCheck = await checkRateLimit({
    key: "fetchRecipes",
    ip,
    limitTimeout: 10000,
    maxAttempts: 3,
  });
  if (!rateLimitCheck.success) {
    return NextResponse.json({
      success: false,
      message: rateLimitCheck.message,
    });
  }

  try {
    const input = searchParams?.get("q");
    const healthOptions = searchParams?.getAll("health");
    const excluded = searchParams?.getAll("excluded");
    const mealType = searchParams?.get("mealType");

    let url = `https://api.edamam.com/api/recipes/v2?q=${input}&type=public&app_id=${process.env.APP_ID}&app_key=${process.env.APP_KEY}`;

    // Add all health parameters
    if (healthOptions && healthOptions.length > 0) {
      healthOptions.forEach((health) => {
        const healthItems = health.split(",");
        healthItems.forEach((item) => {
          url += `&health=${encodeURIComponent(item.trim())}`;
        });
      });
    }

    // Add all meal types
    if (mealType) {
      url += `&mealType=${encodeURIComponent(mealType)}`;
    }

    // Add all excluded ingredients
    if (excluded && excluded.length > 0) {
      excluded.forEach((item) => {
        const excludedItems = item.split(",");
        excludedItems.forEach((item) => {
          url += `&excluded=${encodeURIComponent(item)}`;
        });
      });
    }
    console.log(url);

    const response = await fetch(url);

    if (response.status === 429) {
      return NextResponse.json({
        success: false,
        message: `API Free Tier Usage limits exceeded: try again in a few minutes`,
      });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
}
