
interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId: _ }: ProductReviewsProps) => {
  // Placeholder reviews data
  const reviews = [
    { id: 1, name: 'Sarah J.', rating: 5, content: 'Amazing product! Helped me with my health issues greatly.', date: '2023-05-15' },
    { id: 2, name: 'Michael T.', rating: 4, content: 'Good results after about two weeks of use.', date: '2023-04-22' },
    { id: 3, name: 'Karen L.', rating: 5, content: 'Exactly what I needed. Will order again!', date: '2023-03-10' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Customer Reviews</h3>
      
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-4 mb-4 last:border-0">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{review.name}</span>
            <span className="text-sm text-gray-500">{review.date}</span>
          </div>
          <div className="flex items-center mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-gray-700">{review.content}</p>
        </div>
      ))}
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-center text-gray-600 text-sm">
          These are sample reviews. Review system will be implemented in a future update.
        </p>
      </div>
    </div>
  );
};

export default ProductReviews;
