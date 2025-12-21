export default function DisputePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dispute Details</h1>
      <p className="text-sm text-gray-500 mb-4">🔒 Authentication required</p>
      <p>Dispute ID: {params.id}</p>
    </div>
  );
}
