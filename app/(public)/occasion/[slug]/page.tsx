export default function OccasionDetailsPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Occasion Details</h1>
      <p>Viewing occasion: {params.slug}</p>
    </div>
  );
}
