// app/routes/auth/login.tsx
import { MetaFunction } from '@remix-run/node';
import Login from '~/layout/auth-layout/pages/login';

export const meta: MetaFunction = () => {
  return [
    { title: "Student | Login" },
    { name: "description", content: "Login to your dashboard" },
  ];
};

export default function LoginPage() {
  return <Login />;
}
