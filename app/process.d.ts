declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_AUTH_URL: string;
    NEXT_AUTH_SECRET: string;
    GITHUB_ID: string;
    GITHUB_SECRET: string;
    FACEBOOK_ID: string;
    FACEBOOK_SECRET: string;
    TWITTER_ID: string;
    TWITTER_SECRET: string;
    GOOGLE_ID: string;
    GOOGLE_SECRET: string;
    AUTH0_ID: string;
    AUTH0_SECRET: string;
    NEXT_PUBLIC_GOOGLE_MAPS_API: string;
    NEXT_PUBLIC_HEROKU_URL: string;
    MONGODB_URI: string;
    DB_NAME: string;
  }
}
