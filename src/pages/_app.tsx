import React from "react";
import type { AppProps } from "next/app";
import RootLayout from "@/app/RootLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/styles/globals.css";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Router } from "next/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthHandler from "@/components/Dashboard/AuthHandler";
import "@/styles/globals.css";

// Configure NProgress settings
NProgress.configure({ showSpinner: false });

// Listen to route changes to start and stop the progress bar
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  // Add an optional property `requiresDashboardLayout` on any page
  const requiresDashboardLayout = (Component as any).requiresDashboardLayout;

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootLayout>
            {requiresDashboardLayout ? (
              <AuthHandler>
                <Component {...pageProps} />
              </AuthHandler>
            ) : (
              <Component {...pageProps} />
            )}
          </RootLayout>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default MyApp;
