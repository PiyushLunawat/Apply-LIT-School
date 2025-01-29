// app/routes/auth/sign-up.tsx
import { MetaFunction } from '@remix-run/node';
import SignUp from '~/layout/auth-layout/pages/sign-up';

export const meta: MetaFunction = () => {
  return [
    { title: "Student | Sign Up" },
    { name: "description", content: "Register for an account" },
  ];
};

export default function SignUpPage() {
  return <SignUp />;
}
