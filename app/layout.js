import "./globals.css";

export const metadata = {
    title: 'Vremea',
}

export default function RootLayout({ children }) {
    return (
        <html lang="ro">
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
        </head>
        <body className="bg-slate-950">{children}</body>
        </html>
    );
}
