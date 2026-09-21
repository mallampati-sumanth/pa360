export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-danger mb-4">403 - Unauthorized</h1>
        <p className="text-gray-600">You do not have permission to view this page.</p>
        <a href="/login" className="text-primary hover:underline mt-4 inline-block">Return to Login</a>
      </div>
    </div>
  )
}