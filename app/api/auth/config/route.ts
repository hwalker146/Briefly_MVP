import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    nextauthUrl: process.env.NEXTAUTH_URL,
    googleClientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
    vercelUrl: process.env.VERCEL_URL,
    deploymentUrl: process.env.VERCEL_BRANCH_URL,
    allEnvVars: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      NODE_ENV: process.env.NODE_ENV
    }
  })
}