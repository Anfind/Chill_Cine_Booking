import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Middleware to require admin authentication
 * Checks both authentication AND admin role from database
 * 
 * Usage in API routes:
 * ```ts
 * const adminCheck = await requireAdmin();
 * if (adminCheck) return adminCheck; // Return error response if not admin
 * // Continue with admin logic...
 * ```
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  try {
    // Get session from NextAuth (includes user.role from JWT)
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      console.warn('⚠️ Unauthorized admin route access attempt - No session');
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Bạn cần đăng nhập để thực hiện thao tác này' 
        },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const userRole = (session.user as any).role;
    
    if (userRole !== 'admin') {
      console.warn('⚠️ Forbidden admin route access attempt', {
        email: session.user.email,
        role: userRole
      });
      return NextResponse.json(
        { 
          success: false,
          error: 'Forbidden',
          message: 'Bạn không có quyền thực hiện thao tác này. Chỉ admin mới được phép.' 
        },
        { status: 403 }
      );
    }

    // User is authenticated and is admin
    console.log('✅ Admin access granted', { email: session.user.email });
    return null;
    
  } catch (error) {
    console.error('❌ Error in requireAdmin:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Authentication Error',
        message: 'Lỗi xác thực, vui lòng thử lại' 
      },
      { status: 500 }
    );
  }
}

/**
 * Validate CRON_SECRET for cron job endpoints
 * Returns 401 if secret is missing or invalid
 * 
 * Usage in cron API routes:
 * ```ts
 * const cronCheck = validateCronSecret(request);
 * if (cronCheck) return cronCheck; // Return error response if invalid
 * // Continue with cron logic...
 * ```
 */
export function validateCronSecret(request: Request): NextResponse | null {
  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.replace('Bearer ', '');
  
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error('⚠️ CRON_SECRET not configured in environment variables');
    return NextResponse.json(
      { 
        success: false,
        error: 'Configuration Error',
        message: 'Cron secret not configured' 
      },
      { status: 500 }
    );
  }
  
  if (providedSecret !== cronSecret) {
    console.warn('⚠️ Invalid CRON_SECRET attempt from:', request.headers.get('x-forwarded-for') || 'unknown');
    return NextResponse.json(
      { 
        success: false,
        error: 'Unauthorized',
        message: 'Invalid cron secret' 
      },
      { status: 401 }
    );
  }
  
  console.log('✅ Cron job authenticated');
  return null;
}

/**
 * Optional: Middleware to require staff or admin role
 * Use this for routes that staff can also access
 */
export async function requireStaffOrAdmin(): Promise<NextResponse | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Bạn cần đăng nhập để thực hiện thao tác này' 
        },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    
    if (userRole !== 'admin' && userRole !== 'staff') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Forbidden',
          message: 'Bạn không có quyền thực hiện thao tác này' 
        },
        { status: 403 }
      );
    }

    return null;
    
  } catch (error) {
    console.error('❌ Error in requireStaffOrAdmin:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Authentication Error',
        message: 'Lỗi xác thực, vui lòng thử lại' 
      },
      { status: 500 }
    );
  }
}
