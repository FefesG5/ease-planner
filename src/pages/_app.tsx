import React from "react";
import type { AppProps } from "next/app";
import RootLayout from "@/app/RootLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/styles/globals.css";

import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Router } from "next/router";

// Configure NProgress settings
NProgress.configure({ showSpinner: false });

// Listen to route changes to start and stop the progress bar
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayout>
          <Component {...pageProps} />
        </RootLayout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp;
