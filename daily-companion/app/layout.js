export const metadata = {
  title: 'Daily Companion',
  description: 'Your daily thinking partner',
  manifest: '/manifest.json',
  themeColor: '#1A1612',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Companion',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1A1612',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0B0908' }}>
        {children}
      </body>
    </html>
  );
}
