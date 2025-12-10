import NextTopLoader from 'nextjs-toploader';
import React from 'react';

export default function TopLoader() {
  return (
    <>
      <NextTopLoader
        color="#20201E"
        initialPosition={0.08}
        crawlSpeed={200}
        height={7}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
      />
    </>
  );
}
