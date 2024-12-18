import { MetaFunction } from '@remix-run/node';
import SignUp from '../components/pages/sign-up';

export const meta: MetaFunction = () => {
  return [
    { title: "Register" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function SignUpPage() {
    return <SignUp/>
  }