import React from "react";
import type { AppProps } from "next/app";
import { Router } from "next/router";
import RootLayout from "@/app/RootLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "@/styles/globals.css";

import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <RootLayout>
        <Component {...pageProps} />
      </RootLayout>
    </ThemeProvider>
  );
}

export default MyApp;
