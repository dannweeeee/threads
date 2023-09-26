import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"

import '../globals.css';

export const metadata = {
    title: 'Threads',
    description: 'A Next.js 13 Meta Threads Application by Dann'
}

const inter = Inter({ subsets: ['latin']}) // font: array subsets so that we can have multiple subsets within it

export default function RootLayout({ 
    children // props inside is children to display something within it. 
}: { 
    children: React.ReactNode // typescript requires a type for the children which is React.ReactNode
}) { 
    return (
    <ClerkProvider> 
        <html lang="en"> 
            <body className={`${inter.className} bg-dark-1`}> 
                {children} 
            </body>
        </html>
    </ClerkProvider>
    )
}