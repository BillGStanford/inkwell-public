// Sample book data with PDF viewing capability
const bookData = [
  {
    id: 1,
    title: "The Silent Echo",
    subtitle: "A Mystery in the Mountains",
    description: "When journalist Emma Carter arrives in a small mountain town to investigate a series of unexplained disappearances, she uncovers secrets that someone will kill to keep hidden.",
    content: "<p>Chapter 1: The Arrival</p><p>The mountain air was crisp as Emma stepped off the bus...</p>", // Sample content
    genre: ["Mystery", "Thriller", "Fiction"],
    User: {
      username: "mysterywriter",
      avatar: "/images/authors/mysterywriter.jpg"
    },
    coverImage: "/images/covers/the-silent-echo.jpg",
    price: 7.99,
    createdAt: "2023-05-15T10:00:00.000Z",
    isMonetized: false,
    wordCount: 65234,
    charCount: 356789,
    pdfUrl: "/pdfs/the-silent-echo.pdf", // Path to PDF file
    samplePages: 30, // Number of sample pages to show
    totalPages: 320, // Total pages in book
    rating: 4.5,
    reviews: 128,
    publishedDate: "2023-05-01",
    language: "English",
    isbn: "978-3-16-148410-0"
  },

];

export default bookData;