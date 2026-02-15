import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-[#141414] border border-[#222222]',
          },
        }}
      />
    </div>
  );
}