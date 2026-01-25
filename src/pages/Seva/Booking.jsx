import React, { useState, useEffect } from "react";
import { Container, Modal, Box, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getSevas } from "../../lib/contentService";
import { initiatePayment } from "../../lib/paymentService";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import SEO from "../../components/common/SEO";
import Loader from "../../components/common/Loader/Loader";
import { FiX, FiCalendar, FiUser, FiMusic, FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";

const Booking = () => {
    const { t } = useTranslation();
    const [sevas, setSevas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeva, setSelectedSeva] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        date: "",
        gotram: "",
        nakshatram: "",
        rashi: "",
        kartaName: "",
        notes: "",
    });

    useEffect(() => {
        fetchSevas();
    }, []);

    const fetchSevas = async () => {
        try {
            const data = await getSevas();
            setSevas(data);
        } catch (error) {
            console.error("Error fetching sevas:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookClick = (seva) => {
        setSelectedSeva(seva);
        setFormData({
            ...formData,
            amount: seva.price
        });
    };

    const handleClose = () => {
        setSelectedSeva(null);
        setProcessing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.date || !formData.gotram) {
            toast.error("Please fill in all required fields marked with *");
            return;
        }

        setProcessing(true);

        try {
            // 1. Save Booking Request
            const bookingData = {
                sevaId: selectedSeva.id,
                sevaName: selectedSeva.name,
                price: selectedSeva.price,
                donorName: formData.name,
                donorPhone: formData.phone,
                donorEmail: formData.email,
                sevadate: formData.date,
                gotram: formData.gotram,
                nakshatram: formData.nakshatram,
                rashi: formData.rashi,
                kartaName: formData.kartaName,
                notes: formData.notes,
                status: "pending_payment",
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, "bookings"), bookingData);

            // 2. Initiate Payment
            if (selectedSeva.price > 0) {
                await initiatePayment({
                    amount: selectedSeva.price,
                    purpose: `Seva Booking: ${selectedSeva.name}`,
                    donorName: formData.name,
                    donorEmail: formData.email || "store@temple.com",
                    donorPhone: formData.phone,
                    onSuccess: (res) => {
                        console.log("Payment initiated");
                    },
                    onFailure: (err) => {
                        toast.error("Payment failed to initiate");
                        setProcessing(false);
                    }
                });
            } else {
                // Free Seva?
                toast.success("Booking Request Submitted Successfully!");
                handleClose();
            }

        } catch (error) {
            console.error("Booking failed:", error);
            toast.error("Failed to process booking. Please try again.");
            setProcessing(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="bg-[#FFF8E7] min-h-screen py-12">
            <SEO
                title="Book Seva Online"
                description="Book sevas online at Sri Prasanna Venkateswara Swamy Temple"
            />
            <Container maxWidth="lg">
                <h1 className="text-4xl font-bold text-center text-mainColor mb-2 font-play">Book a Seva Online</h1>
                <div className="w-24 h-1 bg-yellow-500 mx-auto mb-8"></div>

                {sevas.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-xl">
                        No online sevas available at the moment. Please check back later.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sevas.map((seva) => (
                            <div key={seva.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col hover:shadow-xl transition-shadow duration-300">
                                <div className="h-48 overflow-hidden bg-gray-200 relative group">
                                    {seva.imageUrl ? (
                                        <img
                                            src={seva.imageUrl}
                                            alt={seva.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#4A1D15] text-yellow-500">
                                            <span className="text-4xl font-bold font-play">Seva</span>
                                        </div>
                                    )}
                                    <div className="absolute top-0 right-0 bg-yellow-500 text-[#4A1D15] font-bold px-4 py-1 rounded-bl-lg shadow-md">
                                        ₹{seva.price}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-800 mb-1 font-play">{seva.name}</h3>
                                    {seva.nameTelugu && <p className="text-gray-500 font-telugu text-sm mb-3">{seva.nameTelugu}</p>}

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{seva.description}</p>

                                    <button
                                        onClick={() => handleBookClick(seva)}
                                        className="w-full py-3 bg-mainColor text-white font-bold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                                    >
                                        <FiCalendar /> Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Container>

            {/* Booking Form Modal */}
            <Modal
                open={!!selectedSeva}
                onClose={handleClose}
                aria-labelledby="booking-modal"
                container={() => document.getElementById("root")}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '95%', sm: '700px' },
                    bgcolor: 'background.paper',
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    outline: 'none',
                    overflow: 'hidden'
                }}>
                    {selectedSeva && (
                        <>
                            {/* Header */}
                            <div className="bg-[#8B0000] text-white px-6 py-4 flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-2xl font-bold font-play">Book {selectedSeva.name}</h2>
                                    <p className="text-yellow-400 text-sm font-medium">₹{selectedSeva.price} • {selectedSeva.category === 'daily' ? 'Daily' : 'Special'} Seva</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Seva Summary - Optional, maybe just show in header? */}
                                    {/* Let's keep a subtle summary if needed, or jump straight to details */}

                                    {/* Personal Details Section */}
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                        <h3 className="text-lg font-bold text-[#8B0000] mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                                            <div className="bg-yellow-500 text-white p-1.5 rounded-lg"><FiUser size={18} /></div>
                                            Devotee Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter full name"
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] outline-none transition-all"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Mobile Number *</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder="10-digit number"
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] outline-none transition-all"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address (for Receipt)</label>
                                                <input
                                                    type="email"
                                                    placeholder="email@example.com"
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] outline-none transition-all"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seva Details Section */}
                                    <div className="bg-[#FFF8E1] p-5 rounded-xl border border-[#FFE082]">
                                        <h3 className="text-lg font-bold text-[#8B0000] mb-4 flex items-center gap-2 border-b border-[#FFE082] pb-2">
                                            <div className="bg-yellow-500 text-white p-1.5 rounded-lg"><FiCalendar size={18} /></div>
                                            Seva Scheduling
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Select Seva Date *</label>
                                                <input
                                                    type="date"
                                                    required
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] outline-none transition-all font-medium text-gray-800"
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Gotram *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Bharadwaja"
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] outline-none transition-all"
                                                    value={formData.gotram}
                                                    onChange={(e) => setFormData({ ...formData, gotram: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nakshatram</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Rohini"
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] outline-none transition-all"
                                                    value={formData.nakshatram}
                                                    onChange={(e) => setFormData({ ...formData, nakshatram: e.target.value })}
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Special Notes / Family Names</label>
                                                <textarea
                                                    rows="2"
                                                    placeholder="List family members names for sankalpam..."
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] outline-none transition-all resize-none"
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Footer Action */}
                            <div className="p-4 bg-white border-t border-gray-100 flex flex-col items-center gap-3 shrink-0">
                                <button
                                    onClick={handleSubmit}
                                    disabled={processing}
                                    className={`w-full py-3.5 text-white font-bold text-lg rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2 ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#8B0000] to-[#B71C1C] hover:shadow-red-900/30'}`}
                                >
                                    {processing ? (
                                        <>Processing...</>
                                    ) : (
                                        <>Proceed to Pay ₹{selectedSeva.price}</>
                                    )}
                                </button>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Secure Payment via SBI ePay
                                </div>
                            </div>
                        </>
                    )}
                </Box>
            </Modal>
        </div>
    );
};

export default Booking;
