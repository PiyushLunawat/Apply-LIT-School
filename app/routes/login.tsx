import { MetaFunction } from '@remix-run/node';
import Login from '../components/pages/login';

export const meta: MetaFunction = () => {
  return [
    { title: "Login" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function LoginPage() {
    return <Login/>
  }