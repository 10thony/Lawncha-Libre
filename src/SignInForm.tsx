import { SignIn } from "@clerk/clerk-react";

export function SignInForm() {
  return (
    <div className="w-full flex justify-center">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-green-600 hover:bg-green-700',
            footerActionLink: 'text-green-600 hover:text-green-700'
          }
        }}
      />
    </div>
  );
}
