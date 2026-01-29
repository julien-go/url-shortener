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
