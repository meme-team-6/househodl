import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Landing from "./Landing";
import AppWithGroups from "./AppWithGroups";
import GroupCreate from "./GroupCreate";
import GroupManagement from "./GroupManagement";
import GroupTransaction from "./GroupTransaction";
import { Invite } from "./Invite";
import { InviteInvalid } from "./InviteInvalid";
import {
  DynamicContextProvider,
  DynamicUserProfile,
  overrideNetworkRpcUrl,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

// Force dark mode regardless of user's system preference
document.documentElement.classList.add("dark");

// Prevent system preference from overriding dark mode
const forceDarkMode = () => {
  document.documentElement.classList.add("dark");
};

// Add event listener to ensure dark mode persists
window
  .matchMedia("(prefers-color-scheme: light)")
  .addEventListener("change", forceDarkMode);

// Initial call to force dark mode
forceDarkMode();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useIsLoggedIn();

  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }
  return children;
};

// Create router with React Router v7
const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/home",
    element: (
      <PrivateRoute>
        <AppWithGroups />
      </PrivateRoute>
    ),
  },
  {
    path: "/home-filled",
    element: (
      <PrivateRoute>
        <AppWithGroups />
      </PrivateRoute>
    ),
  },
  {
    path: "/group/create",
    element: (
      // <PrivateRoute>
        <GroupCreate />
      // </PrivateRoute>
    ),
  },
  {
    path: "/group/:id/:transactionId",
    element: (
      <PrivateRoute>
        <GroupTransaction />
      </PrivateRoute>
    ),
  },
  {
    path: "/group/:id",
    element: (
      <PrivateRoute>
        <GroupManagement />
      </PrivateRoute>
    ),
  },
  {
    path: "/invite/:id",
    element: (
      <PrivateRoute>
        <Invite />
      </PrivateRoute>
    ),
  },
  {
    path: "/invite",
    element: (
      <PrivateRoute>
        <InviteInvalid />
      </PrivateRoute>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DynamicContextProvider
      settings={{
        environmentId: "a45df874-672d-4433-a4e1-fbdd691303ab",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <DynamicUserProfile />
      <RouterProvider router={router} />
    </DynamicContextProvider>
  </StrictMode>
);
