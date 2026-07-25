import { redirect } from 'next/navigation'

// The dashboard is now one continuous scrolling page (redesign v2). This
// route is kept only so the existing direct URL still works.
export default function SettingsPage() {
  redirect('/dashboard#settings')
}
