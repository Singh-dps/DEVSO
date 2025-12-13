import { useState, useEffect } from 'react';

const API_KEY = 'd4uhohhr01qu53uf5bqgd4uhohhr01qu53uf5br0';

export interface CandleData {
    c: number[]; // Close prices
    h: number[]; // High prices
    l: number[]; // Low prices
    o: number[]; // Open prices
    t: number[]; // Timestamps
    v: number[]; // Volumes
    s: string;   // Status
}

export interface QuoteData {
    c: number; // Current price
    d: number; // Change
    dp: number; // Percent change
    h: number; // High price of the day
    l: number; // Low price of the day
    o: number; // Open price of the day
    pc: number; // Previous close price
}

export function useFinnhub(symbol: string) {
    const [candles, setCandles] = useState<CandleData | null>(null);
    const [quote, setQuote] = useState<QuoteData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Convert internal symbol (mAAPL) to real symbol (AAPL)
    const rawSymbol = symbol.startsWith('m') ? symbol.substring(1) : symbol;
    const isCrypto = ['BTC', 'ETH'].includes(rawSymbol);
    const finnhubSymbol = isCrypto ? `BINANCE:${rawSymbol}USDT` : rawSymbol;

    // Different endpoint for crypto
    const endpointStr = isCrypto ? 'crypto' : 'stock';

    const generateMockData = (): CandleData => {
        const count = 365; // 1 year
        const now = Math.floor(Date.now() / 1000);
        const t = [];
        const c = [];
        const o = [];
        const h = [];
        const l = [];

        // Start price based on symbol
        let price = rawSymbol === 'AAPL' ? 150 :
            rawSymbol === 'TSLA' ? 200 :
                rawSymbol === 'BTC' ? 96000 :
                    rawSymbol === 'ETH' ? 3600 :
                        rawSymbol === 'GLD' ? 230 :
                            rawSymbol === 'SLV' ? 28 :
                                rawSymbol === 'USO' ? 75 :
                                    rawSymbol === 'UNG' ? 18 :
                                        rawSymbol === 'CPER' ? 25 :
                                            rawSymbol === 'CORN' ? 22 :
                                                rawSymbol === 'SOYB' ? 26 :
                                                    rawSymbol === 'WEAT' ? 6 :
                                                        rawSymbol === 'PPLT' ? 90 :
                                                            rawSymbol === 'PALL' ? 95 : 500;

        for (let i = count; i > 0; i--) {
            t.push(now - (i * 24 * 60 * 60));

            // Random walk
            const volatility = isCrypto ? 0.05 : 0.02; // Higher vol for crypto
            const change = (Math.random() - 0.5) * (price * volatility);
            const open = price;
            const close = price + change;

            // Generate realistic High/Low
            const high = Math.max(open, close) + Math.random() * (price * 0.01);
            const low = Math.min(open, close) - Math.random() * (price * 0.01);

            c.push(close);
            o.push(open);
            h.push(high);
            l.push(low);

            price = close;
        }

        return { c, h, l, o, t, v: [], s: 'ok' };
    };

    const fetchCandles = async () => {
        setLoading(true);
        try {
            // Get past 1 year of Daily data for reliability
            const end = Math.floor(Date.now() / 1000);
            const start = end - (60 * 60 * 24 * 365); // 365 days ago

            // https://finnhub.io/api/v1/stock/candle vs https://finnhub.io/api/v1/crypto/candle
            const response = await fetch(
                `https://finnhub.io/api/v1/${endpointStr}/candle?symbol=${finnhubSymbol}&resolution=D&from=${start}&to=${end}&token=${API_KEY}`
            );
            const data = await response.json();
            if (data.s === 'ok') {
                setCandles(data);
            } else {
                console.warn('Finnhub data missing, using mock');
                setCandles(generateMockData());
            }
        } catch (err) {
            console.warn('Finnhub fetch error, using mock');
            setCandles(generateMockData());
            setError('Failed to fetch candles');
        } finally {
            setLoading(false);
        }
    };

    const fetchQuote = async () => {
        try {
            // Quote endpoint handles both via 'symbol' param but we should be consistent
            // Finnhub usually uses /quote for both if symbol is correct
            const response = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${API_KEY}`
            );
            const data = await response.json();
            setQuote(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCandles();
        fetchQuote();

        // Poll for quote every 5 seconds (be mindful of rate limits: 60 calls/min)
        const interval = setInterval(fetchQuote, 5000);
        return () => clearInterval(interval);
    }, [rawSymbol]);

    return { candles, quote, loading, error, refetch: fetchCandles };
}
