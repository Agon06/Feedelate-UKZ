import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getProjektiDorezuar, dorezoProjektin, fshijProjektin, shkarkoProjektin, getTemplateInfo, shkarkoTemplate, getStudentInstructions, downloadInstructionFile } from "../services/projektiApi";
import "./StudentTheme.css";

const DorzimiProjektit = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { subject, lendaId, yearId } = location.state || {};

    const [activeTab, setActiveTab] = useState("projekti");
    const [isDorzuar, setIsDorzuar] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [dorezimData, setDorezimData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasTemplate, setHasTemplate] = useState(false);
    const [templateFileName, setTemplateFileName] = useState("");
    const [projectMaxPoints, setProjectMaxPoints] = useState(100);
    const [projectStartDisplay, setProjectStartDisplay] = useState(null);
    const [projectDeadlineDisplay, setProjectDeadlineDisplay] = useState(null);
    const [projectStartIso, setProjectStartIso] = useState(null);
    const [projectDeadlineIso, setProjectDeadlineIso] = useState(null);
    const [instructions, setInstructions] = useState([]);
    const [instructionsLoading, setInstructionsLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', onConfirm: null });

    const student = JSON.parse(localStorage.getItem('student') || '{}');
    if (!student.id) {
        navigate('/');
        return null;
    }
    const STUDENT_ID = student.id; // Mund ta marrësh nga auth context

    // Fetch projektin e dorëzuar dhe template-in kur ngarkohet komponenti
    useEffect(() => {
        if (lendaId) {
            loadProjektiDorezuar();
            loadTemplateInfo();
            loadInstructions();
        }
    }, [lendaId]);

    // Load instruction templates
    const loadInstructions = async () => {
        try {
            setInstructionsLoading(true);
            const data = await getStudentInstructions(STUDENT_ID, lendaId);
            if (data && Array.isArray(data)) {
                setInstructions(data);
            }
        } catch (error) {
            console.error("Error loading instructions:", error);
            setInstructions([]);
        } finally {
            setInstructionsLoading(false);
        }
    };
    // Auto-refresh project deadline data every 5 seconds to detect changes from profesor
    useEffect(() => {
        if (!lendaId) return;

        const interval = setInterval(() => {
            loadProjektiDorezuar();
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, [lendaId]);

    const formatIsoClockLocal = (isoString) => {
        if (!isoString) return null;
        const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
        if (!match) return null;
        const [, yyyy, mm, dd, hh, min, ss] = match;
        const sec = ss ?? '00';
        return `${dd}/${mm}/${yyyy}, ${hh}:${min}:${sec}`;
    };

    const loadProjektiDorezuar = async () => {
        try {
            setIsLoading(true);
            const data = await getProjektiDorezuar(STUDENT_ID, lendaId);
            setProjectMaxPoints(data?.projectMaxPoints ?? 100);

            // Parse dates preserving the exact clock values saved by profesori (no timezone shift)
            setProjectStartIso(data?.projectStartDate ?? null);
            setProjectDeadlineIso(data?.projectDeadline ?? null);
            setProjectStartDisplay(formatIsoClockLocal(data?.projectStartDate));
            setProjectDeadlineDisplay(formatIsoClockLocal(data?.projectDeadline));

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

    const loadTemplateInfo = async () => {
        try {
            const data = await getTemplateInfo(STUDENT_ID, lendaId);
            if (data.hasTemplate) {
                setHasTemplate(true);
                setTemplateFileName(data.fileName);
            }
        } catch (error) {
            console.error("Error loading template info:", error);
            setHasTemplate(false);
        }
    };

    const handleShkarkoTemplate = async () => {
        try {
            setIsLoading(true);
            await shkarkoTemplate(STUDENT_ID, lendaId, templateFileName);
        } catch (error) {
            alert("Error: " + (error.message || "Nuk u shkarkua template"));
        } finally {
            setIsLoading(false);
        }
    };

    const pageStyle = {
        minHeight: "100vh",
        background: "linear-gradient(180deg, #4F7C82 0%, #0B2E33 60%, #0B2E33 100%)",
        color: "var(--st-text)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    };

    const topBarStyle = {
        background: "rgba(79, 124, 130, 0.25)",
        borderBottom: "1px solid var(--st-border)",
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    };

    const brandStyle = {
        fontSize: 22,
        fontWeight: 800,
        color: "var(--st-1)",
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
        background: "rgba(11, 46, 51, 0.65)",
        border: "1px solid var(--st-border)",
        borderRadius: 18,
        padding: "2rem 1.5rem",
        height: "rem, fit-content",
        position: "sticky",
        top: "2rem",
    };

    const rightPanelStyle = {
        flex: 1,
        background: "rgba(11, 46, 51, 0.65)",
        border: "1px solid var(--st-border)",
        borderRadius: 18,
        padding: "1rem",
    };

    const subjectTitleStyle = {
        fontSize: 24,
        fontWeight: 700,
        color: "var(--st-1)",
        marginBottom: "1.5rem",
        textAlign: "center",
        letterSpacing: 1,
    };

    const tabButtonStyle = (isActive) => ({
        width: "100%",
        padding: "1rem",
        background: isActive ? "rgba(184, 227, 233, 0.18)" : "rgba(11, 46, 51, 0.6)",
        border: `1px solid ${isActive ? "rgba(184, 227, 233, 0.55)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 12,
        color: isActive ? "var(--st-1)" : "var(--st-text)",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        marginBottom: "3rem",
        transition: "all 0.2s",
        textAlign: "left",
    });

    const sectionHeaderStyle = {
        fontSize: 20,
        fontWeight: 700,
        color: "var(--st-1)",
        marginBottom: "1rem",
    };

    const cardStyle = {
        background: "rgba(11, 46, 51, 0.7)",
        border: "1px solid rgba(184, 227, 233, 0.2)",
        borderRadius: 14,
        padding: "1rem",
        marginBottom: "1rem",
    };

    const buttonStyle = {
        background: '#4F7C82',
        border: "none",
        borderRadius: 10,
        padding: "0.85rem 1.5rem",
        color: "#0B2E33",
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
        color: "var(--st-text)",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        width: "100%",
    };

    const handleBack = () => {
        navigate(-1);
    };

    const isDeadlinePassed = projectDeadlineIso ? new Date(projectDeadlineIso).getTime() < Date.now() : false;

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleDorzoProjektin = async () => {
        setSubmitMessage(null);
        if (isDeadlinePassed) {
            setSubmitMessage({ type: "error", text: "Na vjen keq, afati i dorëzimit ka kaluar." });
            return;
        }
        if (!selectedFile) {
            setSubmitMessage({ type: "error", text: "Ju lutem zgjidhni një file!" });
            return;
        }

        try {
            setIsLoading(true);
            const result = await dorezoProjektin(STUDENT_ID, lendaId, selectedFile);
            setIsDorzuar(true);
            setDorezimData(result);
            setSubmitMessage({ type: "success", text: "Projekti u dorëzua me sukses!" });
            // Reload data
            await loadProjektiDorezuar();
        } catch (error) {
            console.error("Full error:", error);
            const rawMessage = error?.message || "Ndodhi një gabim gjatë dorëzimit";
            const isHtml = typeof rawMessage === "string" && /<!doctype|<html/i.test(rawMessage);
            setSubmitMessage({
                type: "error",
                text: isHtml ? "Ndodhi një gabim në server. Provoni përsëri." : `Error: ${rawMessage}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleShkarko = async () => {
        if (dorezimData && dorezimData.id) {
            try {
                setIsLoading(true);
                await shkarkoProjektin(STUDENT_ID, lendaId, dorezimData.fileName);
            } catch (error) {
                alert("Error: " + (error.message || "Nuk u shkarkua"));
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleFshij = async () => {
        setConfirmDialog({
            open: true,
            message: "A jeni të sigurt që dëshironi të fshini projektin e dorëzuar?",
            onConfirm: async () => {
                try {
                    setIsLoading(true);
                    await fshijProjektin(STUDENT_ID, lendaId);
                    setIsDorzuar(false);
                    setSelectedFile(null);
                    setDorezimData(null);
                    setSubmitMessage({ type: 'success', text: 'Projekti u fshi me sukses!' });
                    setTimeout(() => setSubmitMessage(null), 4000);
                } catch (error) {
                    setSubmitMessage({ type: 'error', text: 'Error: ' + error.message });
                    setTimeout(() => setSubmitMessage(null), 4000);
                } finally {
                    setIsLoading(false);
                    setConfirmDialog({ open: false, message: '', onConfirm: null });
                }
            }
        });
    };

    const statusBadgeStyle = (isDorzuar) => ({
        display: "inline-block",
        padding: "0.75rem 1.5rem",
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 700,
        background: isDorzuar
            ? "linear-gradient(135deg, #B8E3E9 0%, #4F7C82 100%)"
            : "linear-gradient(135deg, #f37c7c 0%, #e26464 100%)",
        color: isDorzuar ? "#0B2E33" : "#ffffff",
        border: "none",
    });

    return (
        <div style={pageStyle} className="student-theme">
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
                        style={tabButtonStyle(activeTab === "instruksionet")}
                        onClick={() => setActiveTab("instruksionet")}
                    >
                        Instruksionet
                    </button>
                    <button
                        style={tabButtonStyle(activeTab === "projekti")}
                        onClick={() => setActiveTab("projekti")}
                    >
                        Projekti
                    </button>
                    <button
                        style={tabButtonStyle(activeTab === "piket")}
                        onClick={() => setActiveTab("piket")}
                    >
                        Piket
                    </button>
                    <button
                        style={tabButtonStyle(activeTab === "afatet")}
                        onClick={() => setActiveTab("afatet")}
                    >
                        Afati i dorëzimit
                    </button>

                    {/* Kthehu Mbrapa në fund të sidebar - jashtë tab-ave */}
                    <button style={backButtonStyle} onClick={handleBack}>
                        ← Kthehu Mbrapa
                    </button>
                </div>

                <div style={rightPanelStyle}>
                    {activeTab === "projekti" && (
                        <div>
                            <h2 style={{
                                ...sectionHeaderStyle,
                                textAlign: "center"
                            }}>
                                Dorëzo Projektin
                            </h2>
                            {submitMessage && (
                                <div style={{
                                    marginBottom: "1rem",
                                    padding: "0.85rem 1rem",
                                    borderRadius: 10,
                                    border: submitMessage.type === "success" ? "1px solid rgba(184, 227, 233, 0.35)" : "1px solid rgba(255,99,71,0.4)",
                                    background: submitMessage.type === "success" ? "rgba(184, 227, 233, 0.12)" : "rgba(255,99,71,0.12)",
                                    color: submitMessage.type === "success" ? "var(--st-1)" : "#ff9f8d",
                                    textAlign: "center",
                                    fontWeight: 600
                                }}>
                                    {submitMessage.text}
                                </div>
                            )}
                            <div style={cardStyle}>
                                <p style={{
                                    marginBottom: "1.5rem",
                                    opacity: 0.8,
                                    textAlign: "center"
                                }}>
                                    Ngarko dokumentin e projektit për lëndën <strong>{subject}</strong>.
                                </p>
                                {isDeadlinePassed && (
                                    <div style={{
                                        marginBottom: "1rem",
                                        padding: "0.9rem 1rem",
                                        borderRadius: 10,
                                        background: "rgba(255, 99, 71, 0.1)",
                                        border: "1px solid rgba(255, 99, 71, 0.4)",
                                        color: "#ff9f8d",
                                        textAlign: "center",
                                        fontWeight: 600
                                    }}>
                                        Na vjen keq, afati i dorëzimit ka kaluar.
                                    </div>
                                )}
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    disabled={isLoading || isDeadlinePassed}
                                    style={{
                                        display: "block",
                                        marginBottom: "1rem",
                                        padding: "0.75rem",
                                        background: "rgba(11, 46, 51, 0.7)",
                                        border: "1px solid rgba(184, 227, 233, 0.2)",
                                        borderRadius: 8,
                                        color: "var(--st-text)",
                                        width: "100%",
                                        opacity: (isLoading || isDeadlinePassed) ? 0.5 : 1,
                                        cursor: (isLoading || isDeadlinePassed) ? "not-allowed" : "pointer",
                                        textAlign: "center"
                                    }}
                                />
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <button
                                        style={{ ...buttonStyle, flex: 1, opacity: (isLoading || isDeadlinePassed) ? 0.5 : 1 }}
                                        onClick={handleDorzoProjektin}
                                        disabled={isLoading || isDeadlinePassed}
                                    >
                                        {isLoading ? "Duke procesuar..." : "Dorëzo Projektin"}
                                    </button>
                                    <div style={statusBadgeStyle(isDorzuar)}>
                                        {isDorzuar ? "✓ Dorzuar" : " Pa dorzuar"}
                                    </div>
                                </div>

                                {isDorzuar && dorezimData && (
                                    <div style={{
                                        marginTop: "5rem",
                                        padding: "1rem",
                                        background: "rgba(184, 227, 233, 0.12)",
                                        border: "1px solid rgba(184, 227, 233, 0.3)",
                                        borderRadius: 12
                                    }}>
                                        <h3 style={{
                                            color: "var(--st-1)",
                                            fontSize: 16,
                                            fontWeight: 700,
                                            marginBottom: "0.7rem",
                                            textAlign: "center"
                                        }}>
                                            Projekti i Dorëzuar
                                        </h3>
                                        <div style={{
                                            padding: "0.7rem",
                                            background: "rgba(11, 46, 51, 0.6)",
                                            borderRadius: 8,
                                            marginBottom: "0.7rem",
                                         
                                        }}>
                                            {/* Rreshti 1: Emri i file-it (majtas) + Dorëzuar më (djathtas) */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "1.25rem",
                                                    flexWrap: "wrap",
                                                    fontSize: 14,
                                                    width: "100%"
                                                }}
                                            >
                                                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                                                    <span style={{ opacity: 0.7 }}>Emri i File-it:</span>
                                                    <strong style={{ color: "var(--st-text)" }}>{dorezimData.fileName}</strong>
                                                </div>

                                                {dorezimData.createdAt && (
                                                    <div style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "0.45rem",
                                                        marginLeft: "auto",
                                                        textAlign: "right",
                                                        whiteSpace: "nowrap"
                                                    }}>
                                                        <span style={{ opacity: 0.7 }}>Dorëzuar më:</span>
                                                        <strong style={{ color: "var(--st-text)" }}>
                                                            {new Date(dorezimData.createdAt).toLocaleString('sq-AL')}
                                                        </strong>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Rreshti 2: Statusi */}
                                           
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
                                                    background: "linear-gradient(135deg, #B8E3E9 0%, #4F7C82 100%)",
                                                }}
                                                onClick={handleShkarko}
                                                disabled={isLoading}
                                            >
                                                Shkarko Projektin
                                            </button>
                                            <button
                                                style={{
                                                    ...buttonStyle,
                                                    flex: window.innerWidth < 768 ? "none" : 1,
                                                    background: "linear-gradient(135deg, #f37c7c 0%, #e26464 100%)",
                                                    color: "#ffffff",
                                                }}
                                                onClick={handleFshij}
                                                disabled={isLoading}
                                            >
                                                Fshij Projektin
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "piket" && (
                        <div>
                            <h2 style={{
                                ...sectionHeaderStyle,
                                textAlign: "center"
                            }}>
                                Pikët
                            </h2>
                            <div style={cardStyle}>
                                <p style={{ opacity: 0.7, textAlign: "center" }}>
                                    Informacion mbi pikët e projektit dhe vlerësimin.

                                </p>
                                <div style={{ marginTop: "1.5rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                                        <span>Pikët Totale:</span>
                                        <strong style={{ color: "var(--st-1)" }}>{projectMaxPoints}</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Pikët e Fituara:</span>
                                        <strong style={{ color: "var(--st-1)" }}>
                                            {dorezimData && dorezimData.piket !== undefined ? dorezimData.piket : "--"}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "afatet" && (
                        <div>
                            <h2 style={{
                                ...sectionHeaderStyle,
                                textAlign: "center"
                            }}>
                                Afati i Dorëzimit
                            </h2>
                            <div style={cardStyle}>
                                <p style={{ opacity: 0.7, marginBottom: "1rem", textAlign: "center" }}>
                                    Afatet e dorëzimit për projektin e lëndës <strong>{subject}</strong>.
                                </p>
                                <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                                    <div style={{ padding: "1rem", background: "rgba(11, 46, 51, 0.6)", borderRadius: 8, flex: 1, minWidth: 240 }}>
                                        <strong style={{ color: "var(--st-1)" }}>Data e Fillimit:</strong>
                                        <p style={{ margin: "0.5rem 0 0", opacity: 0.8 }}>
                                            {projectStartDisplay || "--/--/----"}
                                        </p>
                                    </div>
                                    <div style={{ padding: "1rem", background: "rgba(11, 46, 51, 0.6)", borderRadius: 8, flex: 1, minWidth: 240 }}>
                                        <strong style={{ color: "#ff9a9a" }}>Afati i Dorëzimit:</strong>
                                        <p style={{ margin: "0.5rem 0 0", opacity: 0.8 }}>
                                            {projectDeadlineDisplay || "--/--/----"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* HIQE butonin prej këtu */}
                        </div>
                    )}

                    {activeTab === "instruksionet" && (
                        <div>
                            <h2 style={{
                                ...sectionHeaderStyle,
                                textAlign: "center"
                            }}>
                                Instruksionet e Projektit
                            </h2>
                            {instructionsLoading ? (
                                <div style={cardStyle}>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "4rem 2rem",
                                        minHeight: "300px"
                                    }}>
                                        <p style={{ color: "var(--st-1)", fontSize: 16 }}>Duke u ngarkuar instruksionet...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {instructions.length === 0 && !hasTemplate ? (
                                        <div style={cardStyle}>
                                            <div style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: "4rem 2rem",
                                                minHeight: "300px"
                                            }}>
                                                <p style={{
                                                    fontSize: 16,
                                                    fontWeight: 600,
                                                    color: "var(--st-text)"
                                                }}>
                                                    Nuk ka template për këtë lëndë
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                            {instructions.map((instruction) => (
                                                <div key={instruction.id} style={cardStyle}>
                                                    <h3 style={{
                                                        margin: "0 0 1rem 0",
                                                        color: "var(--st-1)",
                                                        fontSize: 18,
                                                        fontWeight: 700
                                                    }}>
                                                        {instruction.title}
                                                    </h3>
                                                    <div style={{
                                                        background: "rgba(11, 46, 51, 0.6)",
                                                        borderRadius: 8,
                                                        padding: "1rem",
                                                        whiteSpace: "pre-wrap",
                                                        wordBreak: "break-word",
                                                        fontSize: 14,
                                                        lineHeight: 1.6,
                                                        color: "var(--st-text)",
                                                        maxHeight: "300px",
                                                        overflow: "auto",
                                                        marginBottom: "1rem"
                                                    }}>
                                                        {instruction.content}
                                                    </div>
                                                    {instruction.files && instruction.files.length > 0 && (
                                                        <div style={{
                                                            background: "rgba(184, 227, 233, 0.12)",
                                                            border: "1px solid rgba(184, 227, 233, 0.25)",
                                                            borderRadius: 8,
                                                            padding: "1rem"
                                                        }}>
                                                            <div style={{
                                                                fontSize: 13,
                                                                fontWeight: 600,
                                                                color: "var(--st-1)",
                                                                marginBottom: "0.75rem"
                                                            }}>
                                                                📎 Fajllat e Lidhur:
                                                            </div>
                                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                                {instruction.files.map((file, idx) => {
                                                                    const formatFileSize = (bytes) => {
                                                                        if (bytes === 0) return '0 B';
                                                                        const k = 1024;
                                                                        const sizes = ['B', 'KB', 'MB', 'GB'];
                                                                        const i = Math.floor(Math.log(bytes) / Math.log(k));
                                                                        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
                                                                    };
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            style={{
                                                                                display: "flex",
                                                                                justifyContent: "space-between",
                                                                                alignItems: "center",
                                                                                background: "rgba(11, 46, 51, 0.6)",
                                                                                padding: "0.75rem 1rem",
                                                                                borderRadius: 6,
                                                                                fontSize: 13
                                                                            }}
                                                                        >
                                                                            <div style={{ color: "var(--st-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                                                                                📄 {file.name} <span style={{ color: "#999", fontSize: 12 }}>({formatFileSize(file.size)})</span>
                                                                            </div>
                                                                            <button
                                                                                style={{
                                                                                    background: "var(--st-1)",
                                                                                    border: "none",
                                                                                    color: "#0B2E33",
                                                                                    padding: "0.4rem 0.8rem",
                                                                                    borderRadius: 4,
                                                                                    cursor: "pointer",
                                                                                    fontSize: 11,
                                                                                    fontWeight: 600,
                                                                                    marginLeft: "0.75rem",
                                                                                    whiteSpace: "nowrap"
                                                                                }}
                                                                                onClick={() => {
                                                                                    downloadInstructionFile(STUDENT_ID, lendaId, file.name)
                                                                                        .catch(error => alert("Error: " + (error.message || "Nuk u shkarkua fajlli")));
                                                                                }}
                                                                            >
                                                                                ⬇ Shkarko
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {hasTemplate && (
                                        <div style={cardStyle}>
                                            <div style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: "2rem"
                                            }}>
                                                <p style={{
                                                    fontSize: 18,
                                                    fontWeight: 600,
                                                    color: "var(--st-1)",
                                                    marginBottom: "1rem",
                                                    textAlign: "center"
                                                }}>
                                                    📄 {templateFileName}
                                                </p>
                                                <p style={{
                                                    fontSize: 14,
                                                    color: "var(--st-text)",
                                                    marginBottom: "2rem",
                                                    textAlign: "center",
                                                    opacity: 0.8
                                                }}>
                                                    Template për lëndën {subject}
                                                </p>
                                                <button
                                                    style={{
                                                        padding: "1rem 2rem",
                                                        background: "linear-gradient(135deg, #4F7C82 0%, #0B2E33 100%)",
                                                        border: "none",
                                                        borderRadius: 12,
                                                        color: "#0B2E33",
                                                        fontSize: 15,
                                                        fontWeight: 700,
                                                        cursor: isLoading ? "not-allowed" : "pointer",
                                                        transition: "all 0.2s",
                                                        boxShadow: "0 4px 12px rgba(11, 46, 51, 0.35)",
                                                        opacity: isLoading ? 0.6 : 1
                                                    }}
                                                    onClick={handleShkarkoTemplate}
                                                    disabled={isLoading}
                                                    onMouseEnter={(e) => {
                                                        if (!isLoading) {
                                                            e.target.style.transform = "translateY(-2px)";
                                                            e.target.style.boxShadow = "0 6px 16px rgba(11, 46, 51, 0.45)";
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = "translateY(0)";
                                                        e.target.style.boxShadow = "0 4px 12px rgba(11, 46, 51, 0.35)";
                                                    }}
                                                >
                                                    {isLoading ? "Duke shkarkuar..." : "⬇ Shkarko Shabilonin"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog.open && (
                <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1500,
                padding: '1rem'
            }}>
                <div style={{
                    background: 'rgba(11, 46, 51, 0.95)',
                    border: '1px solid rgba(184, 227, 233, 0.4)',
                    borderRadius: 20,
                    padding: '2rem',
                    maxWidth: '400px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: 'var(--st-text)',
                        marginBottom: '2rem',
                        lineHeight: 1.5
                    }}>
                        {confirmDialog.message}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => {
                                if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                            }}
                            style={{
                                flex: 1,
                                padding: '0.9rem 1.8rem',
                                borderRadius: 12,
                                border: 'none',
                                background: 'linear-gradient(135deg, #B8E3E9 0%, #4F7C82 100%)',
                                color: '#0B2E33',
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: 'pointer',
                                transition: 'all 200ms ease',
                                boxShadow: '0 4px 12px rgba(11, 46, 51, 0.35)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #CFEFF3 0%, #5B8E96 100%)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(11, 46, 51, 0.45)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #B8E3E9 0%, #4F7C82 100%)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(11, 46, 51, 0.35)';
                            }}
                        >
                            ✓ Po
                        </button>
                        <button
                            onClick={() => {
                                setConfirmDialog({ open: false, message: '', onConfirm: null });
                            }}
                            style={{
                                flex: 1,
                                padding: '0.9rem 1.8rem',
                                borderRadius: 12,
                                border: '1px solid rgba(184, 227, 233, 0.35)',
                                background: 'rgba(11, 46, 51, 0.6)',
                                color: 'var(--st-text)',
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: 'pointer',
                                transition: 'all 200ms ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(184, 227, 233, 0.12)';
                                e.currentTarget.style.borderColor = 'rgba(184, 227, 233, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(11, 46, 51, 0.6)';
                                e.currentTarget.style.borderColor = 'rgba(184, 227, 233, 0.35)';
                            }}
                        >
                            ✕ Jo
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default DorzimiProjektit;