/**
 * 🔧 Medium Publishing API - ClickSprout v1.0
 * 📌 Handles Medium article publishing via Puppeteer automation
 */

import { NextRequest, NextResponse } from 'next/server';
import { postToMedium, testMediumLogin } from '@/utils/mediumPoster';

export async function POST(request: NextRequest) {
  try {
    const { title, content, tags, action } = await request.json();

    // Handle test action
    if (action === 'test') {
      const testResult = await testMediumLogin();
      return NextResponse.json(testResult);
    }

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({
        success: false,
        error: 'Title and content are required',
        platform: 'medium'
      }, { status: 400 });
    }

    // Check environment variables
    if (!process.env.MEDIUM_USERNAME || !process.env.MEDIUM_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'Medium credentials not configured. Please set MEDIUM_USERNAME and MEDIUM_PASSWORD in environment variables.',
        platform: 'medium'
      }, { status: 500 });
    }

    // Publish to Medium
    console.log('🚀 Starting Medium publication...');
    const result = await postToMedium(title, content, { tags });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Article published to Medium successfully',
        url: result.url,
        platform: 'medium',
        timestamp: result.timestamp
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        platform: 'medium',
        timestamp: result.timestamp
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Medium API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error while publishing to Medium',
      details: error instanceof Error ? error.message : 'Unknown error',
      platform: 'medium'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test Medium connection
    const testResult = await testMediumLogin();
    
    return NextResponse.json({
      platform: 'medium',
      status: testResult.success ? 'ready' : 'not_configured',
      automation: 'puppeteer',
      ...testResult
    });

  } catch (error) {
    return NextResponse.json({
      platform: 'medium',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
