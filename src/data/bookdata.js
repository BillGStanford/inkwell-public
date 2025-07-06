const bookData = [
  {
    id: 1,
    title: "Lummox",
    subtitle: "by Fannie Hurst",
    description: "A poignant novel that explores the struggles of a working-class woman navigating hardship, love, and resilience in early 20th-century America.",
    content: "<p>Chapter 1: The Beginning</p><p>Bertha began her day before dawn, with the weight of the world on her shoulders...</p>",
    genre: ["Historical Fiction", "Drama", "Classic"],
    User: {
      username: "fanniehurstfan",
      avatar: "/images/authors/fanniehurst.jpg"
    },
    coverImage: "/images/lummox.jpg",
    price: 5.99,
    createdAt: "2023-01-10T08:00:00.000Z",
    isMonetized: false,
    wordCount: 85000,
    charCount: 470000,
    pdfUrl: "/pdfs/lummox__.html",
    samplePages: 20,
    totalPages: 400,
    rating: 4.2,
    reviews: 95,
    publishedDate: "1923-09-01",
    language: "English",
    isbn: "978-0-123-45678-9"
  },
  {
    id: 2,
    title: "Romeo and Juliet",
    subtitle: "by William Shakespeare",
    description: "A timeless tragedy of young love doomed by fate and family feuds. Romeo and Juliet is one of Shakespeare's most iconic plays.",
    content: "<p>Act I, Scene I</p><p>Two households, both alike in dignity, In fair Verona, where we lay our scene...</p>",
    genre: ["Tragedy", "Romance", "Classic"],
    User: {
      username: "shakespeare",
      avatar: "/images/authors/shakespeare.jpg"
    },
    coverImage: "/images/romeo-and-juliet.jpg",
    price: 0.00,
    createdAt: "2023-02-14T12:00:00.000Z",
    isMonetized: false,
    wordCount: 25845,
    charCount: 140000,
    pdfUrl: "/pdfs/romeo_and_juliet.html",
    samplePages: 10,
    totalPages: 120,
    rating: 4.8,
    reviews: 520,
    publishedDate: "1597-01-01",
    language: "English",
    isbn: "978-0-7434-7712-3"
  },
  {
    id: 3,
    title: "A Room with a View",
    subtitle: "by E. M. Forster",
    description: "Set in Edwardian England and Italy, this novel explores the constraints of society and the liberating power of love, as young Lucy Honeychurch breaks free from convention.",
    content: "<p>Chapter 1: The Bertolini</p><p>The Signora had no business to do it,” said Miss Bartlett, “no business at all...</p>",
    genre: ["Romance", "Classic", "Literary Fiction"],
    User: {
      username: "emforster",
      avatar: "/images/authors/emforster.jpg"
    },
    coverImage: "/images/a-room-with-a-view.jpg",
    price: 0.00,
    createdAt: "2023-03-10T09:30:00.000Z",
    isMonetized: false,
    wordCount: 63500,
    charCount: 360000,
    pdfUrl: "/pdfs/a_room_with_a_view.html",
    samplePages: 15,
    totalPages: 250,
    rating: 4.4,
    reviews: 230,
    publishedDate: "1908-01-01",
    language: "English",
    isbn: "978-0-141-18487-1"
  }
];

export default bookData;
