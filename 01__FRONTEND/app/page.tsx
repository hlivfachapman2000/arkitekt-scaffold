// app/page.tsx - Root page redirecting to flow

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/flow');
}