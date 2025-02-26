CREATE TABLE hacker_news
(
    id         SERIAL PRIMARY KEY,
    article_id INT UNIQUE NOT NULL,
    title      TEXT       NOT NULL,
    url        TEXT,
    checked    BOOLEAN,
    created_at TIMESTAMP  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP  NOT NULL DEFAULT NOW()
);
