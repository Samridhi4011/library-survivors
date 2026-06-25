export const bookCategories = ["fiction", "science", "history", "kids"] as const;

export type BookCategory = (typeof bookCategories)[number];

export interface BookCategoryConfig {
  label: string;
  color: number;
  textColor: string;
}

export const bookCategoryConfig: Record<BookCategory, BookCategoryConfig> = {
  fiction: {
    label: "Fiction",
    color: 0x60a5fa,
    textColor: "#bfdbfe"
  },
  science: {
    label: "Science",
    color: 0x34d399,
    textColor: "#bbf7d0"
  },
  history: {
    label: "History",
    color: 0xfbbf24,
    textColor: "#fde68a"
  },
  kids: {
    label: "Kids",
    color: 0xf472b6,
    textColor: "#fbcfe8"
  }
};

export const getBookTextureKey = (category: BookCategory): string => {
  return `book-${category}`;
};
