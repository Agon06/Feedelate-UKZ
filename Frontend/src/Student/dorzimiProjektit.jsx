import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getProjektiDorezuar, dorezoProjektin, fshijProjektin, shkarkoProjektin } from "../services/projektiApi";

const DorzimiProjektit = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { subject, lendaId, yearId } = location.state || {};
    
    const [activeTab, setActiveTab] = useState("projekti");
    const [isDorzuar, setIsDorzuar] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [dorezimData, setDorezimData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const student = JSON.parse(localStorage.getItem('student') || '{}');
    if (!student.id) {
      navigate('/');
      return null;
    }
    const STUDENT_ID = student.id; // Mund ta marrësh nga auth context

    // Fetch projektin e dorëzuar kur ngarkohet komponenti
    useEffect(() => {
        if (lendaId) {
            loadProjektiDorezuar();
        }
    }, [lendaId]);

    const loadProjektiDorezuar = async () => {
        try {
            setIsLoading(true);
            const data = await getProjektiDorezuar(STUDENT_ID, lendaId);
            if (data.isDorzuar) {
                setIsDorzuar(true);
                setDorezimData(data);
            }
        } catch (error) {
            console.error("Error loading projekt:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const pageStyle = {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a1612 0%, #050a08 100%)",
        color: "#e8f8f0",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    };

    const topBarStyle = {
        background: "rgba(5,12,8,0.95)",
        borderBottom: "1px solid rgba(23,199,122,0.25)",
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    };

    const brandStyle = {
        fontSize: 22,
        fontWeight: 800,
        color: "#17c77a",
        letterSpacing: 0.5,
    };

    const containerStyle = {
        display: "flex",
        maxWidth: 1400,
        margin: "0 auto",
        padding: "2rem",
        gap: "2rem",
        minHeight: "calc(100vh - 80px)",
    };

    const leftPanelStyle = {
        flex: "0 0 280px",
        background: "rgba(9,18,12,0.85)",
        border: "1px solid rgba(23,199,122,0.35)",
        borderRadius: 18,
        padding: "2rem 1.5rem",
        height: "fit-content",
        position: "sticky",
        top: "2rem",
    };

    const rightPanelStyle = {
        flex: 1,
        background: "rgba(9,18,12,0.85)",
        border: "1px solid rgba(23,199,122,0.35)",
        borderRadius: 18,
        padding: "1rem",
    };

    const subjectTitleStyle = {
        fontSize: 24,
        fontWeight: 700,
        color: "#1fdc8c",
        marginBottom: "1.5rem",
        textAlign: "center",
        letterSpacing: 1,
    };

    const tabButtonStyle = (isActive) => ({
        width: "100%",
        padding: "1rem",
        background: isActive ? "rgba(23,199,122,0.25)" : "rgba(9,18,12,0.5)",
        border: `1px solid ${isActive ? "#17c77a" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 12,
        color: isActive ? "#1fdc8c" : "#c4f0da",
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        marginBottom: "0.75rem",
        transition: "all 0.2s",
        textAlign: "left",
    });

    const sectionHeaderStyle = {
        fontSize: 20,
        fontWeight: 700,
        color: "#1fdc8c",
        marginBottom: "1rem",
    };

    const cardStyle = {
        background: "rgba(5,12,8,0.9)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "1rem",
        marginBottom: "1rem",
    };

    const buttonStyle = {
        background: "linear-gradient(135deg, #17c77a 0%, #14b56d 100%)",
        border: "none",
        borderRadius: 10,
        padding: "0.85rem 1.5rem",
        color: "#0a1612",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.2s",
        width: "100%",
    };

    const backButtonStyle = {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 10,
        padding: "0.6rem 1.2rem",
        color: "#c4f0da",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        marginBottom: "1rem",
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleDorzoProjektin = async () => {
        if (!selectedFile) {
            alert("Ju lutem zgjidhni një file!");
            return;
        }

        try {
            setIsLoading(true);
            const result = await dorezoProjektin(STUDENT_ID, lendaId, selectedFile);
            setIsDorzuar(true);
            setDorezimData(result);
            alert("Projekti u dorëzua me sukses!");
            // Reload data
            await loadProjektiDorezuar();
        } catch (error) {
            console.error("Full error:", error);
            alert("Error: " + (error.message || "Ndodhi një gabim gjatë dorëzimit"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleShkarko = () => {
        if (dorezimData && dorezimData.fileDorezimi) {
            shkarkoProjektin(dorezimData.fileDorezimi, dorezimData.fileName);
        }
    };

    const handleFshij = async () => {
        if (!confirm("A jeni të sigurt që dëshironi të fshini projektin e dorëzuar?")) {
            return;
        }

        try {
            setIsLoading(true);
            await fshijProjektin(STUDENT_ID, lendaId);
            setIsDorzuar(false);
            setSelectedFile(null);
            setDorezimData(null);
            alert("Projekti u fshi me sukses!");
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const statusBadgeStyle = (isDorzuar) => ({
        display: "inline-block",
        padding: "0.75rem 1.5rem",
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 700,
        background: isDorzuar 
            ? "linear-gradient(135deg, #17c77a 0%, #14b56d 100%)" 
            : "linear-gradient(135deg, #ff5252 0%, #e04545 100%)",
        color: isDorzuar ? "#0a1612" : "#ffffff",
        border: "none",
    });

    return (
        <div style={pageStyle}>
            <div style={topBarStyle}>
                <div style={brandStyle}>Feedelate</div>
                <div style={{ fontWeight: 600, letterSpacing: 0.6 }}>
                    Universiteti Publik Kadri Zeka
                </div>
            </div>

            <div style={containerStyle}>
                <div style={leftPanelStyle}>
                    <h2 style={subjectTitleStyle}>{subject || "Lënda"}</h2>
                    <button
                        style={tabButtonStyle(activeTab === "projekti")}
                        onClick={() => setActiveTab("projekti")}
                    >
                        📤 Projekti
                    </button>
                    <button
                        style={tabButtonStyle(activeTab === "piket")}
                        onClick={() => setActiveTab("piket")}
                    >
                        📊 Piket
                    </button>
                    <button
                        style={tabButtonStyle(activeTab === "afatet")}
                        onClick={() => setActiveTab("afatet")}
                    >
                        📅 Afati i dorzimit
                    </button>
                </div>

                <div style={rightPanelStyle}>
                    <button style={backButtonStyle} onClick={handleBack}>
                        ← Kthehu Mbrapa
                    </button>

                    {activeTab === "projekti" && (
                        <div>
                            <h2 style={sectionHeaderStyle}>Dorëzo Projektin</h2>
                            <div style={cardStyle}>
                                <p style={{ marginBottom: "1.5rem", opacity: 0.8 }}>
                                    Ngarko dokumentin e projektit për lëndën <strong>{subject}</strong>.
                                </p>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    disabled={isDorzuar || isLoading}
                                    style={{
                                        display: "block",
                                        marginBottom: "1rem",
                                        padding: "0.75rem",
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.15)",
                                        borderRadius: 8,
                                        color: "#c4f0da",
                                        width: "100%",
                                        opacity: isDorzuar ? 0.5 : 1,
                                        cursor: isDorzuar ? "not-allowed" : "pointer"
                                    }}
                                />
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <button 
                                        style={{ ...buttonStyle, flex: 1, opacity: (isDorzuar || isLoading) ? 0.5 : 1 }}
                                        onClick={handleDorzoProjektin}
                                        disabled={isDorzuar || isLoading}
                                    >
                                        {isLoading ? "⏳ Duke procesuar..." : "📤 Dorëzo Projektin"}
                                    </button>
                                    <div style={statusBadgeStyle(isDorzuar)}>
                                        {isDorzuar ? "✓ Dorzuar" : "⏳ Pa dorzuar"}
                                    </div>
                                </div>
                                
                                {isDorzuar && dorezimData && (
                                    <div style={{ 
                                        marginTop: "1rem", 
                                        padding: "1rem", 
                                        background: "rgba(23,199,122,0.08)", 
                                        border: "1px solid rgba(23,199,122,0.25)", 
                                        borderRadius: 12 
                                    }}>
                                        <h3 style={{ 
                                            color: "#1fdc8c", 
                                            fontSize: 16, 
                                            fontWeight: 700, 
                                            marginBottom: "0.7rem" 
                                        }}>
                                            📁 Projekti i Dorëzuar
                                        </h3>
                                        <div style={{ 
                                            padding: "0.7rem", 
                                            background: "rgba(5,12,8,0.5)", 
                                            borderRadius: 8, 
                                            marginBottom: "0.7rem" 
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", fontSize: 14 }}>
                                                <span style={{ opacity: 0.7 }}>Emri i File-it:</span>
                                                <strong style={{ color: "#c4f0da" }}>{dorezimData.fileName}</strong>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", fontSize: 14 }}>
                                                <span style={{ opacity: 0.7 }}>Statusi:</span>
                                                <strong style={{ color: "#17c77a" }}>{dorezimData.statusi}</strong>
                                            </div>
                                            {dorezimData.createdAt && (
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: 14 }}>
                                                    <span style={{ opacity: 0.7 }}>Dorëzuar më:</span>
                                                    <strong style={{ color: "#c4f0da" }}>
                                                        {new Date(dorezimData.createdAt).toLocaleString('sq-AL')}
                                                    </strong>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ 
                                            display: "flex", 
                                            flexDirection: window.innerWidth < 768 ? "column" : "row",
                                            gap: "1rem" 
                                        }}>
                                            <button 
                                                style={{
                                                    ...buttonStyle,
                                                    flex: window.innerWidth < 768 ? "none" : 1,
                                                    background: "linear-gradient(135deg, #17a0c7 0%, #1489b5 100%)",
                                                }}
                                                onClick={handleShkarko}
                                                disabled={isLoading}
                                            >
                                                ⬇️ Shkarko Projektin
                                            </button>
                                            <button 
                                                style={{
                                                    ...buttonStyle,
                                                    flex: window.innerWidth < 768 ? "none" : 1,
                                                    background: "linear-gradient(135deg, #ff5252 0%, #e04545 100%)",
                                                    color: "#ffffff",
                                                }}
                                                onClick={handleFshij}
                                                disabled={isLoading}
                                            >
                                                🗑️ Fshij Projektin
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "piket" && (
                        <div>
                            <h2 style={sectionHeaderStyle}>Pikët</h2>
                            <div style={cardStyle}>
                                <p style={{ opacity: 0.7 }}>
                                    Informacion mbi pikët e projektit dhe vlerësimin.
                                </p>
                                <div style={{ marginTop: "1.5rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                                        <span>Pikët Totale:</span>
                                        <strong style={{ color: "#1fdc8c" }}>30</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Pikët e Fituara:</span>
                                        <strong style={{ color: "#17c77a" }}>
                                            {dorezimData && dorezimData.piket !== undefined ? dorezimData.piket : "--"}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "afatet" && (
                        <div>
                            <h2 style={sectionHeaderStyle}>Afati i Dorëzimit</h2>
                            <div style={cardStyle}>
                                <p style={{ opacity: 0.7, marginBottom: "1rem" }}>
                                    Afatet e dorëzimit për projektin e lëndës <strong>{subject}</strong>.
                                </p>
                                <div style={{ marginTop: "1.5rem" }}>
                                    <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: "0.75rem" }}>
                                        <strong style={{ color: "#1fdc8c" }}>Data e Fillimit:</strong>
                                        <p style={{ margin: "0.5rem 0 0", opacity: 0.8 }}>--/--/----</p>
                                    </div>
                                    <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                                        <strong style={{ color: "#ff5252" }}>Afati i Dorëzimit:</strong>
                                        <p style={{ margin: "0.5rem 0 0", opacity: 0.8 }}>
                                            {dorezimData && dorezimData.afatiDorezimit 
                                                ? new Date(dorezimData.afatiDorezimit).toLocaleDateString('sq-AL')
                                                : "--/--/----"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DorzimiProjektit;