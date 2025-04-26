// Initialize analytics before the app starts
console.log("Analytics initialized");

// Set up global error tracking
window.addEventListener("error", (event) => {
  console.log("global error event");
  // Send to your error tracking service
  window.parent.postMessage(
    {
      type: "VLY_RUNTIME_ERROR",
      error: event.error,
      timestamp: new Date().getTime(),
    },
    "*"
  );
});
