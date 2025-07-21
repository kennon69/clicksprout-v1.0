// Test Reddit API Connection
// This file tests the Reddit API credentials and connection

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if all required Reddit environment variables are present
    const requiredVars = [
      'REDDIT_CLIENT_ID',
      'REDDIT_CLIENT_SECRET', 
      'REDDIT_USERNAME',
      'REDDIT_PASSWORD'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required environment variables: ${missing.join(', ')}`,
        status: 'configuration_error'
      }, { status: 400 });
    }

    // Test Reddit API authentication
    const authResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ClickSprout/1.0',
        'Authorization': `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: process.env.REDDIT_USERNAME!,
        password: process.env.REDDIT_PASSWORD!
      })
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      return NextResponse.json({
        success: false,
        error: 'Reddit authentication failed',
        details: errorText,
        status: 'auth_error'
      }, { status: 401 });
    }

    const authData = await authResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Reddit API connection successful',
      tokenType: authData.token_type,
      expiresIn: authData.expires_in,
      scope: authData.scope,
      status: 'connected'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to test Reddit connection',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 'connection_error'
    }, { status: 500 });
  }
}
