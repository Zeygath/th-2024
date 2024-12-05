import RegistrationForm from '@/components/RegistrationForm'

export default function Register() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Registrer for Treasure Hunt</h1>
      <p className="mb-8 text-center text-gray-600">
        Bli med på jakten!
      </p>
      <RegistrationForm />
    </div>
  )
}
