import { SignIn } from "@clerk/clerk-react";

export function SignInForm() {
  return (
    <div className="w-full">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105',
            footerActionLink: 'text-primary hover:text-primary-hover font-medium',
            formFieldInput: 'auth-input-field',
            card: 'shadow-none border-0 bg-transparent',
            headerTitle: 'text-xl font-semibold text-gray-900 dark:text-gray-100',
            headerSubtitle: 'text-gray-600 dark:text-gray-400',
            socialButtonsBlockButton: 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200',
            socialButtonsBlockButtonText: 'text-gray-700 dark:text-gray-300',
            dividerLine: 'bg-gray-200 dark:bg-gray-700',
            dividerText: 'text-gray-500 dark:text-gray-400',
            identityPreviewText: 'text-gray-600 dark:text-gray-400',
            formResendCodeLink: 'text-primary hover:text-primary-hover',
            otpCodeFieldInput: 'auth-input-field text-center text-lg font-mono',
            formFieldLabel: 'text-sm font-medium text-gray-700 dark:text-gray-300',
            footerActionText: 'text-gray-600 dark:text-gray-400',
            formFieldSuccessText: 'text-primary',
            formFieldErrorText: 'text-red-500',
            identityPreviewEditButton: 'text-primary hover:text-primary-hover',
            formHeaderTitle: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
            formHeaderSubtitle: 'text-gray-600 dark:text-gray-400'
          }
        }}
      />
    </div>
  );
}
