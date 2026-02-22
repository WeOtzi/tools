/**
 * Admin configuration panel.
 *
 * Provides a visual editor for all SiteConfig fields. Changes are held
 * in local component state until "Guardar Cambios" is clicked, at which
 * point they're sent to the Vite save-config middleware.
 *
 * Image uploads use FileReader to convert to base64, which gets sent
 * alongside the config JSON. The server-side middleware decodes and
 * writes them to public/uploads/.
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useConfig, SiteConfig, CardItem } from "../context/ConfigContext";
import { Save, RotateCcw, Plus, Trash2, Home, Image as ImageIcon, Type, Link as LinkIcon, Video, Layout, Upload } from "lucide-react";

export function ConfigPage() {
    const { config, setConfig, saveConfig, resetConfig } = useConfig();
    const [local, setLocal] = useState<SiteConfig>(config);
    const [savedMsg, setSavedMsg] = useState(false);
    const [pendingImages, setPendingImages] = useState<Record<string, string>>({});

    useEffect(() => {
        setLocal(config);
    }, [config]);

    const handleChange = (field: keyof SiteConfig, value: any) => {
        setLocal(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setPendingImages(prev => ({ ...prev, [key]: base64String }));

            // Show optimistic preview
            if (key === 'logoImg') {
                handleChange('logoImg', base64String);
            } else if (key.startsWith('card_bg_')) {
                const idx = parseInt(key.replace('card_bg_', ''), 10);
                updateCard(idx, 'bg', base64String);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        const success = await saveConfig(local, pendingImages);
        if (success) {
            setPendingImages({});
            setSavedMsg(true);
            setTimeout(() => setSavedMsg(false), 3000);
        } else {
            alert("Error al guardar la configuraci\u00f3n.");
        }
    };

    const addCard = () => {
        const newCard: CardItem = {
            id: Date.now(),
            title: "Nuevo T\u00edtulo",
            description: "Descripci\u00f3n de este nuevo m\u00f3dulo.",
            cta: "Bot\u00f3n",
            videoId: "dQw4w9WgXcQ",
            bg: "https://images.unsplash.com/photo-1562259954-bf6c7f31bf60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwdGF0dG9vJTIwcGFybG9yJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzcxNjU1OTAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        };
        setLocal(prev => ({ ...prev, cards: [...prev.cards, newCard] }));
    };

    const updateCard = (index: number, field: keyof CardItem, value: string) => {
        const newCards = [...local.cards];
        newCards[index] = { ...newCards[index], [field]: value };
        setLocal(prev => ({ ...prev, cards: newCards }));
    };

    const removeCard = (index: number) => {
        setLocal(prev => ({ ...prev, cards: prev.cards.filter((_, i) => i !== index) }));
        const newPending = { ...pendingImages };
        delete newPending[`card_bg_${index}`];
        setPendingImages(newPending);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 pt-12 md:pt-20 text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 shadow-sm rounded-lg border border-slate-200">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Layout className="text-cyan-600" size={32} />
                            Panel de Configuraci\u00f3n
                        </h1>
                        <p className="text-slate-500 mt-1">Personaliza el contenido y las im\u00e1genes de tu landing page.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-cyan-600 transition-colors font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg">
                            <Home size={18} />
                            Vista Previa
                        </Link>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                            <Save size={18} />
                            Guardar Cambios
                        </button>
                    </div>
                </div>

                {savedMsg && (
                    <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Cambios guardados correctamente de forma local.
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Form Fields */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Nav & Logo Section */}
                        <div className="bg-white p-6 shadow-sm rounded-lg border border-slate-200 space-y-5">
                            <h2 className="text-xl font-semibold border-b pb-3 mb-4 flex items-center gap-2">
                                <ImageIcon size={20} className="text-slate-400" />
                                Navegaci\u00f3n y Logo
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Subir Logo</label>
                                    <div className="flex items-center gap-4">
                                        {local.logoImg && (
                                            <div className="w-16 h-16 bg-slate-100 rounded border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                <img src={local.logoImg} alt="Preview" className="max-w-full max-h-full object-contain" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-slate-300 rounded-lg p-4 hover:bg-slate-50 hover:border-cyan-400 transition-colors cursor-pointer">
                                                <Upload size={20} className="text-slate-400" />
                                                <span className="text-sm text-slate-600 font-medium">Haz clic para seleccionar una imagen</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logoImg')} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">... o usa una URL directa</label>
                                    <input type="text" value={local.logoImg} onChange={e => handleChange("logoImg", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                </div>

                                <div className="md:col-span-2 border-t border-slate-100 my-2 pt-4" />

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">T\u00edtulo de Navegaci\u00f3n</label>
                                    <input type="text" value={local.navTitle} onChange={e => handleChange("navTitle", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                </div>

                                <div className="md:col-span-2 mt-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-3">Enlaces de Navegaci\u00f3n Principal</label>
                                    <div className="space-y-3">
                                        {local.menuLinks?.map((link, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input type="text" placeholder="Texto (ej. Buscar Artistas)" value={link.text} onChange={e => {
                                                    const newLinks = [...(local.menuLinks || [])];
                                                    newLinks[idx].text = e.target.value;
                                                    handleChange("menuLinks", newLinks);
                                                }} className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                                <input type="text" placeholder="URL (#)" value={link.url} onChange={e => {
                                                    const newLinks = [...(local.menuLinks || [])];
                                                    newLinks[idx].url = e.target.value;
                                                    handleChange("menuLinks", newLinks);
                                                }} className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                                <button onClick={() => {
                                                    const newLinks = (local.menuLinks || []).filter((_, i) => i !== idx);
                                                    handleChange("menuLinks", newLinks);
                                                }} className="p-2 text-red-500 hover:bg-red-50 rounded cursor-pointer transition-colors" title="Eliminar enlace">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={() => handleChange("menuLinks", [...(local.menuLinks || []), { text: "Nuevo Enlace", url: "#" }])} className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 cursor-pointer mt-2 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded transition-colors w-max">
                                            <Plus size={14} /> A\u00f1adir enlace de navegaci\u00f3n
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Section */}
                        <div className="bg-white p-6 shadow-sm rounded-lg border border-slate-200 space-y-5">
                            <h2 className="text-xl font-semibold border-b pb-3 mb-4 flex items-center gap-2">
                                <Type size={20} className="text-slate-400" />
                                Textos Principales (Hero)
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">T\u00edtulo</label>
                                        <input type="text" value={local.heroTitle} onChange={e => handleChange("heroTitle", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Subt\u00edtulo</label>
                                        <input type="text" value={local.heroSubtitle} onChange={e => handleChange("heroSubtitle", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">P\u00e1rrafo Principal</label>
                                    <textarea rows={3} value={local.heroText} onChange={e => handleChange("heroText", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Texto del Bot\u00f3n "PU\u00c9BAME"</label>
                                        <input type="text" value={local.pruebameText} onChange={e => handleChange("pruebameText", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">URL del Bot\u00f3n</label>
                                        <input type="text" value={local.pruebameUrl} onChange={e => handleChange("pruebameUrl", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-white p-6 shadow-sm rounded-lg border border-slate-200 space-y-5">
                            <h2 className="text-xl font-semibold border-b pb-3 mb-4 flex items-center gap-2">
                                <LinkIcon size={20} className="text-slate-400" />
                                Pie de P\u00e1gina (Footer)
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Texto Copyright</label>
                                <input type="text" value={local.footerText} onChange={e => handleChange("footerText", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                            </div>
                            <div className="space-y-3 mt-4">
                                <label className="block text-sm font-medium text-slate-700">Enlaces</label>
                                {local.footerLinks.map((link, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input type="text" placeholder="Texto" value={link.text} onChange={e => {
                                            const newLinks = [...local.footerLinks];
                                            newLinks[idx].text = e.target.value;
                                            handleChange("footerLinks", newLinks);
                                        }} className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                        <input type="text" placeholder="URL" value={link.url} onChange={e => {
                                            const newLinks = [...local.footerLinks];
                                            newLinks[idx].url = e.target.value;
                                            handleChange("footerLinks", newLinks);
                                        }} className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                        <button onClick={() => {
                                            const newLinks = local.footerLinks.filter((_, i) => i !== idx);
                                            handleChange("footerLinks", newLinks);
                                        }} className="p-2 text-red-500 hover:bg-red-50 rounded cursor-pointer">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => handleChange("footerLinks", [...local.footerLinks, { text: "Nuevo Enlace", url: "#" }])} className="text-sm text-cyan-600 hover:underline flex items-center gap-1 cursor-pointer">
                                    <Plus size={14} /> A\u00f1adir enlace
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white p-6 shadow-sm rounded-lg border border-slate-200 flex flex-col h-[calc(100%-120px)] min-h-[500px]">
                            <div className="flex justify-between items-center border-b pb-3 mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Layout size={20} className="text-slate-400" />
                                    Tarjetas Carrusel
                                </h2>
                                <button onClick={addCard} className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-sm transition-colors font-medium cursor-pointer">
                                    <Plus size={16} /> A\u00f1adir
                                </button>
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                                {local.cards.map((card, idx) => (
                                    <div key={card.id || idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4 relative group">
                                        <button onClick={() => removeCard(idx)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10 bg-white rounded-full shadow-sm">
                                            <Trash2 size={16} />
                                        </button>

                                        <div className="space-y-3 relative z-0">

                                            {/* Card Background Image Upload */}
                                            <div className="mb-3">
                                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Fondo de Tarjeta</label>
                                                <div className="flex gap-3 items-start">
                                                    <div className="w-16 h-12 bg-slate-200 rounded overflow-hidden shadow-sm shrink-0 border border-slate-300">
                                                        {card.bg && <img src={card.bg} alt="bg" className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div className="flex-1 flex flex-col gap-2">
                                                        <label className="flex items-center justify-center gap-1 w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors shadow-sm">
                                                            <Upload size={14} /> Subir Imagen
                                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, `card_bg_${idx}`)} />
                                                        </label>
                                                        <input type="text" value={card.bg} onChange={e => updateCard(idx, "bg", e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none" placeholder="O pega una URL..." />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-200 my-2" />

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">T\u00edtulo {idx + 1}</label>
                                                <input type="text" value={card.title} onChange={e => updateCard(idx, "title", e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Descripci\u00f3n</label>
                                                <textarea rows={2} value={card.description} onChange={e => updateCard(idx, "description", e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none resize-none" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Bot\u00f3n (CTA)</label>
                                                    <input type="text" value={card.cta} onChange={e => updateCard(idx, "cta", e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider flex items-center gap-1"><Video size={10} /> ID Video YT</label>
                                                    <input type="text" value={card.videoId} onChange={e => updateCard(idx, "videoId", e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none" placeholder="ej. dQw4w9WgXcQ" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {local.cards.length === 0 && (
                                    <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                                        No hay tarjetas. A\u00f1ade una para empezar.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reset Defaults */}
                        <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                            <h3 className="text-red-800 font-semibold mb-2 flex items-center gap-2">
                                <RotateCcw size={18} />
                                Zona de Peligro
                            </h3>
                            <p className="text-red-600 text-sm mb-4">Esta acci\u00f3n restablecer\u00e1 todo el contenido de la landing page a sus valores originales y borrar\u00e1 los fondos subidos.</p>
                            <button
                                onClick={async () => {
                                    if (confirm("\u00bfEst\u00e1s seguro de que deseas restablecer los valores por defecto?")) {
                                        const success = await resetConfig();
                                        if (success) {
                                            setSavedMsg(true);
                                            setTimeout(() => setSavedMsg(false), 3000);
                                        }
                                    }
                                }}
                                className="flex items-center gap-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 font-medium py-2 px-4 rounded transition-colors text-sm cursor-pointer"
                            >
                                Restaurar Configuraci\u00f3n Inicial
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
