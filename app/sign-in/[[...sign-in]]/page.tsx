import GoogleSignIn from "./GoogleSignIn";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <GoogleSignIn />
    </div>
  );
}
