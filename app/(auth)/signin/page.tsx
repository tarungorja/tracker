import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return <AuthForm purpose="signin" />;
}
