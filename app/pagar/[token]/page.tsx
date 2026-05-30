import PagarClient from "./PagarClient"

const KNOWN_TOKENS = ["demo-token", "token-tech", "token-constructora", "token-agropecuaria"]

export function generateStaticParams() {
  return KNOWN_TOKENS.map((token) => ({ token }))
}

export default async function PagarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <PagarClient token={token} />
}
