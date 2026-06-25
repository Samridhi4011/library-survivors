import type { BookCategory } from "./bookConfig";

export interface ShelfConfig {
  id: string;
  category: BookCategory;
  x: number;
  y: number;
}

export const shelfConfigs: ShelfConfig[] = [
  { id: "fiction-a", category: "fiction", x: 270, y: 160 },
  { id: "science-a", category: "science", x: 520, y: 160 },
  { id: "history-a", category: "history", x: 770, y: 160 },
  { id: "kids-a", category: "kids", x: 1030, y: 160 },
  { id: "fiction-b", category: "fiction", x: 1290, y: 160 },
  { id: "science-b", category: "science", x: 270, y: 380 },
  { id: "history-b", category: "history", x: 520, y: 380 },
  { id: "kids-b", category: "kids", x: 770, y: 380 },
  { id: "fiction-c", category: "fiction", x: 1030, y: 380 },
  { id: "science-c", category: "science", x: 1290, y: 380 },
  { id: "history-c", category: "history", x: 270, y: 620 },
  { id: "kids-c", category: "kids", x: 520, y: 620 },
  { id: "fiction-d", category: "fiction", x: 770, y: 620 },
  { id: "science-d", category: "science", x: 1030, y: 620 },
  { id: "history-d", category: "history", x: 1290, y: 620 },
  { id: "kids-d", category: "kids", x: 520, y: 840 },
  { id: "fiction-e", category: "fiction", x: 770, y: 840 },
  { id: "science-e", category: "science", x: 1030, y: 840 }
];
