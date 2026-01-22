import GoogleSignIn from "./GoogleSignIn";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col premium-gradient-bg">
      <Header isLogued={false} />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <GoogleSignIn />
      </main>
      
      <Footer />
    </div>
  );
}
