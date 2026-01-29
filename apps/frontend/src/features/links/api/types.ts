export type CreateShortUrlInput = {
  originalUrl: string;
  code?: string;
};

export type CreateShortUrlResponse = {
  createShortUrl: {
    shortLink: string;
    shortUrl: {
      id: string;
      code: string;
      originalUrl: string;
      createdAt: string;
    };
  };
};

export type MyLink = {
  id: string;
  code: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
  shortLink: string;
};

export type MyLinksResponse = {
  myLinks: {
    totalCount: number;
    nextCursor: string | null;
    items: MyLink[];
  };
};
