import LoginForm from '@/components/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Logg inn
          </h2>
        </div>
        <LoginForm />
        <div className="text-center">
          <p className="mt-2 text-sm text-gray-600">
            Har du ikkke en konto? {' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Registrer deg her
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

