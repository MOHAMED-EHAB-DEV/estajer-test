self.addEventListener("install", () => console.log("Service installing."));
self.addEventListener("activate", () => console.log("Service activating."));
self.addEventListener("push", (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
    vibrate: data.vibrate || [200, 100, 200],
    actions: data.actions || [],
    data: data?.data || {},
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Add this new event listener for notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close(); // Close the notification

  const urlToOpen = event.notification.data?.url;

  // Handle button actions
  if (event.action === "open") {
    event.waitUntil(clients.openWindow(urlToOpen));
  } else if (event.action === "dismiss") {
    // Just close, do nothing
    return;
  } else {
    // Default click (clicking the notification body, not a button)
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window open with this URL
          for (let client of clientList) {
            if (client.url === urlToOpen && "focus" in client) {
              return client.focus();
            }
          }
          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});
