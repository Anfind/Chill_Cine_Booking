import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Standard error response structure
 */
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: unknown;
}

/**
 * Standard success response structure
 */
interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Create a standardized error response
 * Handles different error types: ZodError, MongoDB errors, custom Error, unknown
 */
export function errorResponse(error: unknown, statusCode = 500): NextResponse<ErrorResponse> {
  console.error('❌ API Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const firstError = error.errors[0];
    return NextResponse.json(
      {
        success: false,
        error: 'Validation Error',
        message: firstError?.message || 'Dữ liệu không hợp lệ',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
      { status: 400 }
    );
  }

  // Handle MongoDB duplicate key errors
  if (error && typeof error === 'object' && 'code' in error) {
    const mongoError = error as { code?: number; keyPattern?: Record<string, unknown> };
    
    if (mongoError.code === 11000) {
      const duplicateField = mongoError.keyPattern 
        ? Object.keys(mongoError.keyPattern)[0] 
        : 'unknown';
      
      return NextResponse.json(
        {
          success: false,
          error: 'Duplicate Error',
          message: `${duplicateField} đã tồn tại trong hệ thống`,
          details: { field: duplicateField },
        },
        { status: 409 }
      );
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.name || 'Error',
        message: error.message || 'Đã xảy ra lỗi',
      },
      { status: statusCode }
    );
  }

  // Handle unknown error types
  return NextResponse.json(
    {
      success: false,
      error: 'Unknown Error',
      message: 'Đã xảy ra lỗi không xác định',
      details: typeof error === 'string' ? error : undefined,
    },
    { status: statusCode }
  );
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status: statusCode }
  );
}

/**
 * Create a "not found" error response
 */
export function notFoundResponse(resource = 'Resource'): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Not Found',
      message: `${resource} không tồn tại`,
    },
    { status: 404 }
  );
}

/**
 * Create a "bad request" error response
 */
export function badRequestResponse(message: string): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Bad Request',
      message,
    },
    { status: 400 }
  );
}
