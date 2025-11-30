"use client";
export default function HomePage() {
  return (
    <div>
      {/* Categories Simple */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-3">
          {['All', 'Fiction', 'Science', 'Technology', 'History', 'Art'].map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Books</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="h-40 bg-gray-200 rounded mb-3 flex items-center justify-center">
              <span className="text-gray-500">Book Cover</span>
            </div>
            <h3 className="font-medium">Book Title</h3>
            <p className="text-sm text-gray-600">Author Name</p>
            <p className="text-xs text-gray-500 mt-2">Category</p>
          </div>

          <div className="border rounded-lg p-4">
            <div className="h-40 bg-gray-200 rounded mb-3 flex items-center justify-center">
              <span className="text-gray-500">Book Cover</span>
            </div>
            <h3 className="font-medium">Book Title</h3>
            <p className="text-sm text-gray-600">Author Name</p>
            <p className="text-xs text-gray-500 mt-2">Category</p>
          </div>

          <div className="border rounded-lg p-4">
            <div className="h-40 bg-gray-200 rounded mb-3 flex items-center justify-center">
              <span className="text-gray-500">Book Cover</span>
            </div>
            <h3 className="font-medium">Book Title</h3>
            <p className="text-sm text-gray-600">Author Name</p>
            <p className="text-xs text-gray-500 mt-2">Category</p>
          </div>
        </div>

        {/* API Loading State */}
        <div className="text-center py-8 text-gray-500">
          Books data will be loaded from API
        </div>
      </div>
    </div>
  );
}