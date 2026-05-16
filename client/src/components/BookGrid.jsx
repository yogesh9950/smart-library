const BookGrid = ({ books, renderActions }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {books.map((book) => (
      <div key={book._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{book.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{book.author}</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {book.category}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>Total: {book.totalCopies}</span>
          <span>Available: {book.availableCopies}</span>
        </div>
        {renderActions ? <div className="mt-4">{renderActions(book)}</div> : null}
      </div>
    ))}
  </div>
);

export default BookGrid;
