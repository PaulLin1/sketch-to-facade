'use client';

import { useRef, useState } from 'react';

type Color = 'red' | 'green' | 'blue';

export default function Page() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState<Color>('red');
    const [history, setHistory] = useState<ImageData[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

    const [city, setCity] = useState('Vienna');
    const cities = ['Vienna', 'Brussels', 'New York', 'London', 'Chicago', 'Rome', 'Bucharest', 'Bern'];

    // New state to hold generated image
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setIsDrawing(true);

        const ctx = canvasRef.current!.getContext('2d');
        if (ctx) setHistory(prev => [...prev, ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height)]);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || !startPos) return;
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const lastState = history[history.length - 1];
        if (lastState) ctx.putImageData(lastState, 0, 0);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        setStartPos(null);
    };

    const handleUndo = () => {
        const canvas = canvasRef.current;
        if (!canvas || history.length === 0) return;
        const ctx = canvas.getContext('2d')!;
        const last = history[history.length - 1];
        ctx.putImageData(last, 0, 0);
        setHistory(prev => prev.slice(0, -1));
    };

    const handleGenerate = async () => {
        if (!canvasRef.current) return;

        try {
            const canvas = canvasRef.current;
            const imageDataUrl = canvas.toDataURL('image/png');

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city, sketch: imageDataUrl }),
            });

            const data = await response.json();
            console.log('API output:', data.output);

            // Set the generated image URL to state
            setGeneratedImage(data.output); // assuming API returns base64 URL or direct image URL
        } catch (err) {
            console.error('Error calling API:', err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-gray-800 text-white p-6 text-center text-2xl font-bold">
                Sketch to Facade
            </header>

            <main className="flex flex-1 flex-col md:flex-row">
                {/* Left side: canvas */}
                <div className="w-full md:flex-1 p-8 flex flex-col items-center">
                    <div className="mb-4 flex items-center space-x-2">
                        <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded"
                        >
                            {cities.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => setColor('red')}>Window</button>
                        <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={() => setColor('green')}>Balcony</button>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setColor('blue')}>Door</button>
                        <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={handleUndo}>Undo</button>
                    </div>

                    <canvas
                        ref={canvasRef}
                        width={500}
                        height={500}
                        className="border border-gray-400 w-full max-w-md aspect-square cursor-crosshair"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />

                    <button
                        className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        onClick={handleGenerate}
                    >
                        Generate
                    </button>
                </div>

                {/* Right side: display generated image */}
                <div className="flex-1 bg-white p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-300">
                    {generatedImage ? (
                        <img src={generatedImage} alt="Generated facade" className="max-w-full max-h-full rounded shadow-lg" />
                    ) : (
                        <p className="text-gray-700">Generated image will appear here</p>
                    )}
                </div>
            </main>
        </div>
    );
}
