import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign up" };

export default function SignUpPage() {
  return <AuthForm purpose="signup" />;
}
