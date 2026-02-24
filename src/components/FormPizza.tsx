import { useState, useEffect, useRef, useLayoutEffect  } from "react";

type ChartItem = {
  label: string;
  value: number;
  labelColor: string;
};

const FormPizza = () => {
    const [words, setWords] = useState<string | undefined>();
    const [listWords, setListWords] = useState<(string | undefined)[]>([]);
    const [percentages, setPercentages] = useState<{[key: string]: number}>({});
    const [chartData, setChartData] = useState<{ label: string; value: number; labelColor: string;}[]>([]);
    const divRef = useRef<HTMLDivElement | null>(null);
    const [dimensoes, setDimensoes] = useState({
        largura: 0,
        altura: 0,
    });

    const handleSubmit: React.ComponentProps<'form'>['onSubmit'] = (e) => {
        e.preventDefault();

        setListWords(prev => [...prev, words]);
        setWords('');
    };

    useLayoutEffect(() => {
        if (chartData.length === 0) return;

        const el = divRef.current;
        if (!el) return;

        requestAnimationFrame(() => {
            const { width, height } = el.getBoundingClientRect();

            setDimensoes({
                largura: width,
                altura: height,
            });
        });
    }, [chartData]);

    useEffect(() => {
        let newCount: { [key: string]: number } = {};
        let totalLabels = 0; 

        for (let i = 0; i < listWords.length; i++) {
            let current: string | undefined = listWords[i];

            if (current) {
                newCount[current] = (newCount[current] || 0) + 1;
            }
        }
        
        for(const key in newCount) {
            totalLabels = totalLabels + newCount[key];
        }

        for(const key in newCount) {
            percentages[key] = (newCount[key] / totalLabels) * 100;
        }

        const randomColors = () => {
            const colors = [
                "#ff6384",
                "#36a2eb",
                "#ffce56",
                "#4bc0c0",
                "#9966ff",
                "#ff9f40",
            ];
            return colors;
        }

        const getColors = randomColors();
        const getInfoschartData = Object.entries(percentages).map(([key, value], index) => ({
            label: key,
            value: value,
            labelColor: getColors[index % getColors.length],
        }));


        setPercentages(percentages);
        setChartData(getInfoschartData);
    }, [listWords]);


    const getLabelStyle = (item: ChartItem, idx: number) => {
        const prevValue = chartData.slice(0, idx).reduce((sum, prev) => sum + prev.value, 0);
        const center = prevValue + (item.value / 2);
        const centerAngle = center * 3.6 - 90; // A partir do centro o ponteiro aponta pra um lado. 
        const radian = centerAngle * (Math.PI / 180);
        const radiusPizza = dimensoes.largura / 2; // O raio é o que determina o quanto vai andar na direção que o ponteiro aponta.
        const radiusLabel = radiusPizza * (0.45 + (1 - item.value / 100) * 0.25); // Normalmente a gente usa uma fração do raio
        const centerX = dimensoes.largura / 2;
        const centerY = dimensoes.altura / 2;
        const x = centerX + Math.cos(radian) * radiusLabel;
        const y = centerY + Math.sin(radian) * radiusLabel;

        return {
            position: "absolute" as const,
            left: `${x}px`,
            top: `${y}px`,
            transform: "translate(-50%, -50%)",
            fontSize: "12px",
            fontWeight: "bold",
            color: "#000",
            pointerEvents: "none" as const,
            whiteSpace: "nowrap",
        }
    }

  return (
    <>
        <div className="min-h-screen flex flex-col justify-center items-center mt-[-60px]">
            <h1 className="font-bold text-2xl md:text-3xl lg:text-6xl text-center text-gray-700">Word Frequency Analyzer </h1>
            <p className="text-md md:text-lg lg:text-xl text-center text-gray-500 mt-5">Type words and see their distribution </p>

            <div className="all-content relative">
                <form className="mt-5" onSubmit={handleSubmit}>
                    <div>
                        <div className="mt-2">
                            <div className="w-full md:w-sm m-auto flex items-center rounded-sm bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                                <input
                                    id="words"
                                    name="words"
                                    type="text"
                                    placeholder="Type here..."
                                    className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    value={words || ''}
                                    onChange={(e) => setWords(e.target.value)}
                                />
                            </div>
                        </div>
                        <button 
                            className="cursor-pointer w-full md:w-sm block m-auto mt-2 bg-blue-500 text-white font-bold rounded-sm p-2 px-5 hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" 
                            type="submit">
                            Submit
                        </button>
                    </div>
                </form>

                <div className="flex flex-col items-center md:flex-row md:absolute md:right-0 md:left-[calc(17%)] w-full">
                    {chartData && chartData.length > 0 && (
                        <>
                        <div className="general-box relative">
                            <div
                                ref={divRef} 
                                className="mt-8 m-auto relative"
                                style={{
                                    width: 250,
                                    height: 250,
                                    borderRadius: "50%",
                                    background: `conic-gradient(${chartData.map((item, idx) => {
                                        const prevValue = chartData.slice(0, idx).reduce((sum, prev) => sum + prev.value, 0);
                                        return `${item.labelColor} ${prevValue}% ${prevValue + item.value}%`;
                                    }).join(', ')})`,
                                }}
                            >
                                {chartData.map((item, idx) => (
                                    <span key={item.label} style={getLabelStyle(item, idx)}>
                                        {item.value.toFixed(1)}%
                                    </span>
                                ))}
                            </div>
                        </div>

                        <ul className="mt-5 md:ml-5">
                            {chartData.map((item) => (
                                <li className="flex items-center mr-5" key={item.label}>
                                    <span
                                        className="mr-2 block w-[10px] h-[10px]"
                                        style={{
                                            background: `${item.labelColor}`
                                        }}
                                    >
                                    </span>
                                    <span className="font-bold mr-2">
                                        {item.label}:
                                    </span>
                                    {item.value.toFixed(1)}%
                                </li>
                            ))}
                        </ul> 
                        </>
                    )}
                </div>
            </div>
        </div>
    </>
  )
}

export default FormPizza