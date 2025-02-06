export const handleError = (error: any) => {
  console.error("Error:", error); // Log the error for debugging

  // Format the error message
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return {
    message: errorMessage,
    status: error.status || 500, // Default to 500 if no status is provided
  };
};
