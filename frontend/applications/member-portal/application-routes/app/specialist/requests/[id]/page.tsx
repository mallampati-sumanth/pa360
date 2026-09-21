import { redirect } from 'next/navigation';

type RequestDetailRedirectProps = {
  params: Promise<{ id: string }>;
};

export default async function RequestDetailRedirect({ params }: RequestDetailRedirectProps) {
  const { id } = await params;
  redirect(`/specialist/authorizations/${id}`);
}
