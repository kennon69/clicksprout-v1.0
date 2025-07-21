/**
 * 🔧 Advanced AI Scraper API - ClickSprout v1.0
 * 📌 Handles intelligent web scraping and AI content generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { scrapeAndGenerate, quickScrape } from '@/utils/scraper';

type ScrapeResult = {
  success: boolean;
  error?: string;
  [key: string]: any;
};

export async function POST(request: NextRequest) {
  try {
    const { url, mode = 'full' } = await request.json();

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Valid URL is required',
        code: 'INVALID_URL'
      }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid URL format',
        code: 'MALFORMED_URL'
      }, { status: 400 });
    }

    console.log(`🚀 Processing ${mode} scrape for: ${url}`);

    let result: ScrapeResult;
    
    if (mode === 'quick') {
      // Quick scrape mode - faster, less detailed
      result = await quickScrape(url) as ScrapeResult;
    } else {
      // Full scrape mode - comprehensive AI-powered analysis
      result = await scrapeAndGenerate(url) as ScrapeResult;
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Content generated successfully',
        data: result,
        mode,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Scraping failed',
        code: 'SCRAPE_FAILED',
        url
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Advanced scraper API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error during scraping',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const mode = searchParams.get('mode') || 'quick';

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL parameter is required',
        usage: {
          POST: 'Send { "url": "https://example.com", "mode": "full|quick" }',
          GET: '?url=https://example.com&mode=quick'
        }
      }, { status: 400 });
    }

    console.log(`🚀 GET request - ${mode} scrape for: ${url}`);

    let result: ScrapeResult;
    
    if (mode === 'quick') {
      result = await quickScrape(url) as ScrapeResult;
    } else {
      result = await scrapeAndGenerate(url) as ScrapeResult;
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Content generated successfully',
        data: result,
        mode,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Scraping failed',
        code: 'SCRAPE_FAILED',
        url
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Advanced scraper GET error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error during scraping',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
