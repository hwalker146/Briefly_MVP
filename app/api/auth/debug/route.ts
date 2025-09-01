import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
    nextauthSecret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
    nextauthUrl: process.env.NEXTAUTH_URL || 'Missing'
  })
}