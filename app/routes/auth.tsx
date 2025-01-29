// app/routes/auth.tsx
import { Outlet } from '@remix-run/react';
import AuthLayout from '~/layout/auth-layout/components/AuthLayout';

export default function AuthRoute() {
  return <AuthLayout />;
}
