import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to home page after authentication
  return NextResponse.redirect(requestUrl.origin);
}
