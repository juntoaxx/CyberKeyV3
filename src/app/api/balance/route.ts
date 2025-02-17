import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { apiKey, organizationId } = await request.json();

    if (!apiKey || !organizationId) {
      return NextResponse.json(
        {
          balance: null,
          error: 'API key and Organization ID are required',
          status: 'error'
        },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/usage', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-organization': organizationId,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Handle specific HTTP error codes
      switch (response.status) {
        case 401:
          return NextResponse.json({
            balance: null,
            error: 'Invalid API key or Organization ID',
            status: 'error'
          }, { status: 401 });
        case 403:
          return NextResponse.json({
            balance: null,
            error: 'Access forbidden. Please check your credentials',
            status: 'error'
          }, { status: 403 });
        case 429:
          return NextResponse.json({
            balance: null,
            error: 'Rate limit exceeded. Please try again later',
            status: 'error'
          }, { status: 429 });
        case 500:
        case 502:
        case 503:
        case 504:
          return NextResponse.json({
            balance: null,
            error: 'Anthropic API is temporarily unavailable',
            status: 'error'
          }, { status: response.status });
        default:
          return NextResponse.json({
            balance: null,
            error: `API Error: ${response.status} ${response.statusText}`,
            status: 'error'
          }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json({
      balance: data.balance_cents / 100,
      status: 'success'
    });

  } catch (error) {
    console.error('Balance check error:', error);

    if (error instanceof Error) {
      if ('code' in error && error.code === 'ECONNREFUSED') {
        return NextResponse.json({
          balance: null,
          error: 'Unable to connect to Anthropic API. Please check your internet connection',
          status: 'error'
        }, { status: 503 });
      }
      
      if (error.message.includes('network') || error.message.includes('connection')) {
        return NextResponse.json({
          balance: null,
          error: 'Network error: Unable to reach Anthropic API. Please try again later',
          status: 'error'
        }, { status: 503 });
      }
    }

    return NextResponse.json({
      balance: null,
      error: 'Failed to check balance. Please try again later',
      status: 'error'
    }, { status: 500 });
  }
}
