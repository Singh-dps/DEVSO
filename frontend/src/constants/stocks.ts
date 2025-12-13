export interface Stock {
    symbol: string;
    name: string;
    sector: string;
}

export const TOP_STOCKS: Stock[] = [
    { symbol: 'BTC', name: 'Bitcoin', sector: 'Crypto' },
    { symbol: 'ETH', name: 'Ethereum', sector: 'Crypto' },
    // Commodities (ETFs)
    { symbol: 'GLD', name: 'Gold', sector: 'Commodities' },
    { symbol: 'SLV', name: 'Silver', sector: 'Commodities' },
    { symbol: 'USO', name: 'United States Oil', sector: 'Commodities' },
    { symbol: 'UNG', name: 'Natural Gas', sector: 'Commodities' },
    { symbol: 'CPER', name: 'Copper', sector: 'Commodities' },
    { symbol: 'CORN', name: 'Corn', sector: 'Commodities' },
    { symbol: 'SOYB', name: 'Soybeans', sector: 'Commodities' },
    { symbol: 'WEAT', name: 'Wheat', sector: 'Commodities' },
    { symbol: 'PPLT', name: 'Platinum', sector: 'Commodities' },
    { symbol: 'PALL', name: 'Palladium', sector: 'Commodities' },

    // Japan (ADRs)
    { symbol: 'TM', name: 'Toyota Motor', sector: 'Consumer Cyclical' },
    { symbol: 'SONY', name: 'Sony Group', sector: 'Technology' },
    { symbol: 'NTDOY', name: 'Nintendo Co', sector: 'Technology' },
    { symbol: 'MUFG', name: 'Mitsubishi UFJ', sector: 'Financial Services' },

    // Europe (ADRs)
    { symbol: 'ASML', name: 'ASML Holding', sector: 'Technology' },
    { symbol: 'LVMUY', name: 'LVMH Moet Hennessy', sector: 'Consumer Cyclical' },
    { symbol: 'NVO', name: 'Novo Nordisk', sector: 'Healthcare' },
    { symbol: 'SHEL', name: 'Shell PLC', sector: 'Energy' },

    // Hong Kong / China (ADRs)
    { symbol: 'BABA', name: 'Alibaba Group', sector: 'Consumer Cyclical' },
    { symbol: 'TCEHY', name: 'Tencent Holdings', sector: 'Communication Services' },
    { symbol: 'BYDDY', name: 'BYD Company', sector: 'Consumer Cyclical' },
    { symbol: 'JD', name: 'JD.com', sector: 'Consumer Cyclical' },

    // US Stocks
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corp', sector: 'Technology' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services' },
    { symbol: 'AMZN', name: 'Amazon.com Inc', sector: 'Consumer Cyclical' },
    { symbol: 'NVDA', name: 'NVIDIA Corp', sector: 'Technology' },
    { symbol: 'TSLA', name: 'Tesla Inc', sector: 'Consumer Cyclical' },
    { symbol: 'META', name: 'Meta Platforms', sector: 'Communication Services' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Financial Services' },
    { symbol: 'TSM', name: 'Taiwan Semiconductor', sector: 'Technology' },
    { symbol: 'V', name: 'Visa Inc', sector: 'Financial Services' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
    { symbol: 'WMT', name: 'Walmart Inc', sector: 'Consumer Defensive' },
    { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financial Services' },
    { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy' },
    { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer Defensive' },
    { symbol: 'MA', name: 'Mastercard Inc', sector: 'Financial Services' },
    { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare' },
    { symbol: 'HD', name: 'Home Depot', sector: 'Consumer Cyclical' },
    { symbol: 'CVX', name: 'Chevron Corp', sector: 'Energy' },
    { symbol: 'MRK', name: 'Merck & Co', sector: 'Healthcare' },
    { symbol: 'ABBV', name: 'AbbVie Inc', sector: 'Healthcare' },
    { symbol: 'LLY', name: 'Eli Lilly', sector: 'Healthcare' },
    { symbol: 'KO', name: 'Coca-Cola', sector: 'Consumer Defensive' },
    { symbol: 'AVGO', name: 'Broadcom Inc', sector: 'Technology' },
    { symbol: 'PEP', name: 'PepsiCo Inc', sector: 'Consumer Defensive' },
    { symbol: 'PFE', name: 'Pfizer Inc', sector: 'Healthcare' },
    { symbol: 'COST', name: 'Costco Wholesale', sector: 'Consumer Defensive' },
    { symbol: 'ORCL', name: 'Oracle Corp', sector: 'Technology' },
    { symbol: 'TMO', name: 'Thermo Fisher', sector: 'Healthcare' },
    { symbol: 'MCD', name: 'McDonald\'s', sector: 'Consumer Cyclical' },
    { symbol: 'DIS', name: 'Walt Disney', sector: 'Communication Services' },
    { symbol: 'NKE', name: 'Nike Inc', sector: 'Consumer Cyclical' },
    { symbol: 'CSCO', name: 'Cisco Systems', sector: 'Technology' },
    { symbol: 'VZ', name: 'Verizon', sector: 'Communication Services' },
    { symbol: 'DHR', name: 'Danaher Corp', sector: 'Healthcare' },
    { symbol: 'CRM', name: 'Salesforce', sector: 'Technology' },
    { symbol: 'ADBE', name: 'Adobe Inc', sector: 'Technology' },
    { symbol: 'ABT', name: 'Abbott Labs', sector: 'Healthcare' },
    { symbol: 'NFLX', name: 'Netflix Inc', sector: 'Communication Services' },
    { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology' },
    { symbol: 'INTC', name: 'Intel Corp', sector: 'Technology' },
    { symbol: 'QCOM', name: 'Qualcomm', sector: 'Technology' },
    { symbol: 'IBM', name: 'IBM', sector: 'Technology' },
    { symbol: 'TXN', name: 'Texas Instruments', sector: 'Technology' },
    { symbol: 'PM', name: 'Philip Morris', sector: 'Consumer Defensive' },
    { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financial Services' },
    { symbol: 'CAT', name: 'Caterpillar', sector: 'Industrials' },
    { symbol: 'BA', name: 'Boeing Co', sector: 'Industrials' },
    { symbol: 'GS', name: 'Goldman Sachs', sector: 'Financial Services' },
    { symbol: 'HON', name: 'Honeywell', sector: 'Industrials' }
];
