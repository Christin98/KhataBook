import { NextRequest, NextResponse } from 'next/server';
import { DatePeriod, UserPreferences } from '@/lib/types';

const VALID_PERIODS: DatePeriod[] = [
  'all_time',
  'this_month',
  'last_month',
  'last_3_months',
  'last_6_months',
  'this_year'
];

// In-memory fallback store for server-side lifecycle
let storedPreferences: UserPreferences = {
  datePeriod: 'all_time',
  currency: '₹',
  theme: 'light'
};

export async function GET(request: NextRequest) {
  try {
    // Check cookie fallback if available
    const cookiePref = request.cookies.get('khatakithab_preferences')?.value;
    let currentPrefs = { ...storedPreferences };
    if (cookiePref) {
      try {
        const decoded = decodeURIComponent(cookiePref);
        const parsed = JSON.parse(decoded);
        currentPrefs = { ...currentPrefs, ...parsed };
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      preferences: currentPrefs
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.datePeriod && !VALID_PERIODS.includes(body.datePeriod)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid datePeriod '${body.datePeriod}'. Must be one of: ${VALID_PERIODS.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Merge new preferences without resetting other existing fields
    storedPreferences = {
      ...storedPreferences,
      ...body
    };

    const response = NextResponse.json({
      success: true,
      preferences: storedPreferences
    });

    // Also persist via safely encoded cookie
    try {
      const safeCookieVal = encodeURIComponent(JSON.stringify(storedPreferences));
      response.cookies.set('khatakithab_preferences', safeCookieVal, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax'
      });
    } catch (e) {
      console.warn('Cookie set warning:', e);
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

