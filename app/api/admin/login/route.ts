import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/login
 * Admin login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = body?.password;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('❌ ADMIN_PASSWORD is not defined in .env.local');
      return NextResponse.json(
        { 
          error: 'Server configuration error. ADMIN_PASSWORD is missing.'
        },
        { status: 500 }
      );
    }

    const cleanedPassword = String(password).trim().replace(/\s+/g, '');
    const cleanedAdminPassword = String(adminPassword).trim().replace(/\s+/g, '');
    
    if (cleanedPassword === cleanedAdminPassword) {
      try {
        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'authenticated', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        return NextResponse.json({
          success: true,
          message: 'Login successful',
        });
      } catch (cookieError: any) {
        console.error('❌ Error setting cookie:', cookieError);
        return NextResponse.json(
          { 
            error: 'An error occurred while creating the session',
            debug: cookieError?.message || 'Unknown cookie error'
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('❌ Error in login route:', error);
    return NextResponse.json(
      { 
        error: 'An error occurred during login',
        debug: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
