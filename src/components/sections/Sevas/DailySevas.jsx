import React, { useState, useEffect } from "react";
// Daily Sevas Component
import { getSevaSchedule } from "../../../lib/firestoreService";

const DailySevas = ({ type = "daily", layout }) => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const data = await getSevaSchedule(type);
                setSchedule(data || []);
            } catch (error) {
                console.error(`Error loading ${type} sevas:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [type]);

    if (loading) {
        return (
            <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-mainColor"></div>
            </div>
        );
    }

    if (schedule.length === 0) return null;

    // --- RENDER HELPERS ---

    // 1. Daily View (Timeline)
    if (type === "daily") {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="relative">
                    <div className="absolute left-[85px] md:left-1/2 top-4 bottom-4 w-1 bg-yellow-400 transform -translate-x-1/2"></div>
                    <div className="space-y-6">
                        {schedule.map((item, index) => (
                            <div key={index} className="relative flex items-center">
                                <div className="w-[80px] md:w-1/2 text-right pr-8 md:pr-12">
                                    <span className="text-lg md:text-xl font-bold text-gray-800 font-montserrat">{item.time}</span>
                                </div>
                                <div className="absolute left-[85px] md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-600 rotate-45 border-2 border-white shadow-sm z-10"></div>
                                <div className="flex-1 pl-8 md:pl-12">
                                    <h3 className="text-lg md:text-xl font-bold text-mainColor font-play">{item.name}</h3>
                                    {item.nameTe && <p className="text-gray-600 font-medium font-telugu" style={{ fontFamily: "'Ramabhadra', sans-serif" }}>{item.nameTe}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Grouping for other views
    const grouped = schedule.reduce((acc, item) => {
        const header = item.header || "Others";
        if (!acc[header]) acc[header] = { items: [], subHeader: item.subHeader };
        acc[header].items.push(item);
        return acc;
    }, {});

    // 2. Weekly View (Cards)
    if (type === "weekly") {
        return (
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {Object.entries(grouped).map(([header, { items }], idx) => (
                        <div key={idx} className="bg-[#4A1D15] rounded-lg overflow-hidden shadow-lg border-2 border-yellow-500">
                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-3">
                                <h3 className="text-2xl font-bold text-[#4A1D15] font-play text-center">{header}</h3>
                            </div>
                            <div className="p-6 bg-white bg-opacity-95">
                                {items.map((item, i) => (
                                    <div key={i} className="mb-4 last:mb-0 border-b border-dashed border-gray-300 last:border-0 pb-3 last:pb-0">
                                        {item.time && (
                                            <div className="inline-block bg-[#4A1D15] text-white text-xs px-2 py-1 rounded mb-1 font-bold">
                                                {item.time}
                                            </div>
                                        )}
                                        <h4 className="text-lg font-bold text-gray-800">{item.name}</h4>
                                        {item.nameTe && <p className="text-gray-600 font-telugu">{item.nameTe}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 3. Monthly View (Split Layout)
    if (type === "monthly") {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {Object.entries(grouped).map(([header, { items, subHeader }], idx) => (
                        <div key={idx} className="bg-[#FFF8E7] rounded-xl p-6 border border-yellow-200 shadow-md">
                            <h3 className="text-2xl font-bold text-[#D32F2F] font-play mb-1 border-b-2 border-yellow-400 inline-block pb-1">{header}</h3>
                            {subHeader && <p className="text-[#D32F2F] font-semibold text-sm mb-4">{subHeader}</p>}

                            <div className="space-y-4 mt-4">
                                {items.map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        {item.time && (
                                            <div className="min-w-[80px] font-bold text-gray-800 text-right text-sm pt-1">{item.time}</div>
                                        )}
                                        <div className="relative pt-2">
                                            <div className="w-2 h-2 bg-[#D32F2F] rounded-full mt-1.5"></div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-[#8B0000] leading-tight">{item.name}</h4>
                                            {item.nameTe && <p className="text-gray-600 text-sm mt-1 font-telugu">{item.nameTe}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 4. Auspicious View (Banners)
    if (type === "auspicious") {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
                {Object.entries(grouped).map(([header, { items, subHeader }], idx) => (
                    <div key={idx} className="bg-[#4A0404] text-white rounded-xl overflow-hidden shadow-2xl flex flex-col items-center text-center p-8 relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500"></div>
                        <h3 className="text-3xl md:text-4xl font-bold font-play mb-2">{header}</h3>
                        {subHeader && (
                            <div className="bg-yellow-500 text-[#4A0404] px-6 py-2 rounded-full font-bold text-sm md:text-base mb-6 inline-block transform -skew-x-12">
                                <span className="transform skew-x-12 inline-block">{subHeader}</span>
                            </div>
                        )}
                        {/* If there are items with names, list them, though Auspicious usually just header/subheader */}
                        {items.some(i => i.name) && (
                            <div className="mt-4 space-y-2">
                                {items.map((item, i) => item.name && (
                                    <div key={i}>
                                        <h4 className="text-xl font-bold text-yellow-300">{item.name}</h4>
                                        {item.nameTe && <p className="text-gray-300">{item.nameTe}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-full h-2 bg-yellow-500"></div>
                    </div>
                ))}
            </div>
        );
    }

    return null;
};

export default DailySevas;
