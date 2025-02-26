import { hackerNewsGraph } from './hackernews.graph';

describe('Run HackerNews Graph', () => {
  test('isAiRelated is true', async () => {
    const response = await hackerNewsGraph.invoke({
      document: aiRelatedFixture,
    });
    expect(response.isAiRelated).toBe(true);
  });

  test('isAiRelated is false if the document is about stock', async () => {
    const response = await hackerNewsGraph.invoke({
      document: stockRelatedFixture,
    });
    console.log(response);
    expect(response.isAiRelated).toBe(false);
  });
});

const aiRelatedFixture = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Future of Artificial Intelligence</title>
</head>
<body>
  <article>
    <h1>The Future of Artificial Intelligence</h1>
    <p>
      Artificial Intelligence (AI) is rapidly transforming various aspects of modern society. Through innovations in machine learning, deep learning, and neural networks, AI is solving complex problems and revolutionizing industries worldwide.
    </p>
    <p>
      In sectors such as autonomous driving, healthcare diagnostics, finance, and customer service, AI technologies are already making significant contributions. These advancements not only improve efficiency but also pave the way for groundbreaking research and innovative business models.
    </p>
    <p>
      Additionally, AI plays a crucial role in big data analytics and decision-making processes. Researchers and developers are continuously working to enhance AI capabilities while also addressing ethical concerns and ensuring transparency in AI systems.
    </p>
    <p>
      As AI continues to evolve, it is expected to remain a cornerstone of technological innovation, profoundly influencing the future of our society.
    </p>
  </article>
</body>
</html>
`;

const stockRelatedFixture = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Introduction to Stocks</title>
</head>
<body>

    <h1>Understanding Stocks and the Stock Market</h1>

    <h2>What is a Stock?</h2>
    <p>A stock represents ownership in a company. When you buy a share of stock, you own a small part of the company and may benefit from its growth and profits.</p>

    <h2>Types of Stocks</h2>
    <ul>
        <li><strong>Common Stock:</strong> Gives shareholders voting rights and dividends (if the company distributes them).</li>
        <li><strong>Preferred Stock:</strong> Typically offers fixed dividends but does not provide voting rights.</li>
    </ul>

    <h2>Stock Exchanges</h2>
    <p>Stocks are traded on stock exchanges, which act as marketplaces for buyers and sellers. Major stock exchanges include:</p>
    <ul>
        <li>New York Stock Exchange (NYSE)</li>
        <li>Nasdaq</li>
        <li>London Stock Exchange (LSE)</li>
        <li>Tokyo Stock Exchange (TSE)</li>
    </ul>

    <h2>Stock Market Indexes</h2>
    <p>Indexes track the performance of a group of stocks. Key indexes include:</p>
    <ul>
        <li><strong>S&P 500:</strong> Tracks 500 large U.S. companies.</li>
        <li><strong>Dow Jones Industrial Average:</strong> Follows 30 major U.S. companies.</li>
        <li><strong>Nasdaq Composite:</strong> Focuses on technology and growth companies.</li>
    </ul>

    <h2>Factors Affecting Stock Prices</h2>
    <p>Stock prices fluctuate due to various factors, including:</p>
    <ul>
        <li><strong>Earnings Reports:</strong> Quarterly profits impact investor confidence.</li>
        <li><strong>Economic Data:</strong> Inflation, employment rates, and GDP affect market trends.</li>
        <li><strong>Interest Rates:</strong> Higher rates can slow growth, reducing stock prices.</li>
        <li><strong>Market Sentiment:</strong> News, investor emotions, and geopolitical events influence prices.</li>
    </ul>

    <h2>Basic Investment Strategies</h2>
    <p>Investors use different strategies to grow their wealth:</p>
    <ul>
        <li><strong>Long-Term Investing:</strong> Holding stocks for years to benefit from growth.</li>
        <li><strong>Day Trading:</strong> Buying and selling stocks within a single trading day.</li>
        <li><strong>Value Investing:</strong> Finding undervalued stocks with strong fundamentals.</li>
        <li><strong>Dividend Investing:</strong> Focusing on stocks that pay regular dividends.</li>
    </ul>

    <p>Understanding stocks is key to making informed investment decisions. Research and patience are essential for success in the stock market.</p>

</body>
</html>
`;
