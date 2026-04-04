import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Loader from "../../Components/Loader";



const GenerateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    service: "",
    description: "",
  });

  const [files, setFiles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [servcat, setSerVact] = useState([]);
  const [charCount, setCharCount] = useState(0);
  const [editorFormat, setEditorFormat] = useState("richtext");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const fetchServices = async () => {
    try {
      const { data } = await API.get("/api/service/");
      setSerVact(data);
    } catch (err) {
      console.log("Service fetch error:", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const editor = useEditor({
    extensions: React.useMemo(() => [
      StarterKit.configure(),
      TextStyle.configure(),
      Color.configure(),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ], []),
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      if (editorFormat === "richtext") {
        setCharCount(text.length);
        setForm(prev => ({ ...prev, description: html }));
        if (text.trim() !== "") setFieldErrors(prev => ({ ...prev, description: "" }));
      }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors(prev => ({ ...prev, [name]: "" }));
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMarkdownChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, description: val }));
    setCharCount(val.length);
    if (val.trim() !== "") setFieldErrors(prev => ({ ...prev, description: "" }));
  };

  const syncContent = (toFormat) => {
    if (toFormat === "richtext" && editor && form.description) {
      editor.commands.setContent(form.description);
    }
    setEditorFormat(toFormat);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      setError("Maximum 5 files allowed.");
      return;
    }
    setError("");
    setFiles(prev => [...prev, ...selectedFiles]);
    e.target.value = null;
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errors = {};
    if (!form.service) errors.service = "Category required";
    if (!form.title) errors.title = "Title required";

    if (editorFormat === "richtext") {
      if (!editor || editor.getText().trim() === "") errors.description = "Description required";
    } else {
      if (!form.description || form.description.trim() === "") errors.description = "Description required";
    }

    if (files.length === 0) {
      errors.files = "At least one file is mandatory";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const data = new FormData();
    Object.keys(form).forEach(key => data.append(key, form[key]));
    files.forEach(file => data.append("attachments", file));

    try {
      await API.post("/api/complaints/", data);
      navigate("/mytickets");
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-5" style={{ background: "var(--bg-color)", minHeight: "100vh" }}>
      {loading && <Loader />}
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div
            className="card border-0 shadow-sm rounded-4 overflow-hidden"
            style={{
              borderTop: "4px solid",
              borderImage: "linear-gradient(90deg, #FF8C00, #0b5299) 1"
            }}
          >
            <div className="px-3 px-md-3 py-4 py-md-3">
              <div className="text-center mb-5">
                <h2 className="fw-bold mb-2" style={{ color: "var(--primary-color)", fontFamily: "'Poppins', !important", fontWeight: "bold" }}>Generate Ticket</h2>
                <p className="text-muted">Raise a new support ticket by filling the details below</p>
              </div>

              {error && <div className="alert alert-danger mb-4 rounded-3">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-uppercase tracking-wider">Category *</label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0"><i className="bi bi-tag text-primary"></i></span>
                      <select className={`form-select border-start-0 ${fieldErrors.service ? "is-invalid" : ""}`} name="service" value={form.service} onChange={handleChange}>
                        <option value="">Select Category</option>
                        {servcat.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-uppercase tracking-wider">Name *</label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0"><i className="bi bi-person text-primary"></i></span>
                      <input className="form-control border-start-0" value={form.name} disabled />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-uppercase tracking-wider">Email *</label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0"><i className="bi bi-envelope text-primary"></i></span>
                      <input className="form-control border-start-0" value={form.email} disabled />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-uppercase tracking-wider">Phone *</label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0"><i className="bi bi-telephone text-primary"></i></span>
                      <input className="form-control border-start-0" value={form.phone} disabled />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small text-uppercase tracking-wider">Title *</label>
                  <div className="input-group mb-2">
                    <span className="input-group-text border-end-0"><i className="bi bi-pencil text-primary"></i></span>
                    <input className={`form-control border-start-0 ${fieldErrors.title ? "is-invalid" : ""}`} name="title" value={form.title} onChange={handleChange} placeholder="Enter short issue title (Max 30 chars)" maxLength={30} />
                  </div>
                  <small className="text-muted">Summarize the issue in a few words (Max 30 chars)</small>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold small text-uppercase tracking-wider mb-0">Description *</label>
                    <span className="small text-muted">{charCount}/5000</span>
                  </div>

                  <div className="border rounded-3 overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="p-2 border-bottom d-flex gap-1 flex-wrap align-items-center" style={{ backgroundColor: 'var(--stat-card-bg)', borderColor: 'var(--border-color) !important' }}>
                      {editorFormat === "richtext" ? (
                        <>
                          <div className="btn-group me-1">
                            <button type="button" className={`btn btn-sm ${editor?.isActive("bold") ? "btn-primary" : "btn-light border"}`} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold"><i className="bi bi-type-bold"></i></button>
                            <button type="button" className={`btn btn-sm ${editor?.isActive("italic") ? "btn-primary" : "btn-light border"}`} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic"><i className="bi bi-type-italic"></i></button>
                            <button type="button" className={`btn btn-sm ${editor?.isActive("underline") ? "btn-primary" : "btn-light border"}`} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="Underline"><i className="bi bi-type-underline"></i></button>
                            <button type="button" className={`btn btn-sm ${editor?.isActive("strike") ? "btn-primary" : "btn-light border"}`} onClick={() => editor?.chain().focus().toggleStrike().run()} title="Strike"><i className="bi bi-type-strikethrough"></i></button>
                          </div>

                          <div className="btn-group me-1">
                            <button type="button" className={`btn btn-sm ${editor?.isActive("bulletList") ? "btn-primary" : "btn-light border"}`} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet List"><i className="bi bi-list-ul"></i></button>
                            <button type="button" className={`btn btn-sm ${editor?.isActive("orderedList") ? "btn-primary" : "btn-light border"}`} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Ordered List"><i className="bi bi-list-ol"></i></button>
                          </div>

                          <div className="btn-group me-1">
                            <button type="button" className={`btn btn-sm ${editor?.isActive({ textAlign: "left" }) ? "btn-primary" : "btn-light border"}`} onClick={() => editor?.chain().focus().setTextAlign("left").run()} title="Align Left"><i className="bi bi-text-left"></i></button>
                            <button type="button" className={`btn btn-sm ${editor?.isActive({ textAlign: "center" }) ? "btn-primary" : "btn-light border"}`} onClick={() => editor?.chain().focus().setTextAlign("center").run()} title="Align Center"><i className="bi bi-text-center"></i></button>
                            <button type="button" className={`btn btn-sm ${editor?.isActive({ textAlign: "right" }) ? "btn-primary" : "btn-light border"}`} onClick={() => editor?.chain().focus().setTextAlign("right").run()} title="Align Right"><i className="bi bi-text-right"></i></button>
                          </div>

                          <div className="d-flex align-items-center gap-1 border rounded px-1 me-1" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color) !important' }}>
                            <i className="bi bi-palette text-muted small"></i>
                            <input type="color" className="form-control form-control-color border-0 p-0" style={{ width: "20px", height: "20px" }} onInput={e => editor?.chain().focus().setColor(e.target.value).run()} title="Text Color" />
                          </div>

                          <button type="button" className={`btn btn-sm ${editor?.isActive("highlight") ? "btn-warning" : "btn-light border"}`} onClick={() => editor?.chain().focus().toggleHighlight().run()} title="Highlight"><i className="bi bi-highlighter"></i></button>
                        </>
                      ) : (
                        <div className="d-flex align-items-center gap-2 mb-0 py-1 ms-2">
                          <i className="bi bi-markdown-fill text-primary fs-5"></i>
                          <span className="small fw-semibold text-primary">Markdown Editor Active</span>
                          <span className="small text-muted d-none d-md-inline">(Directly input markdown syntax)</span>
                        </div>
                      )}

                    </div>
                    <div style={{ minHeight: "250px", backgroundColor: "var(--card-bg)" }}>
                      {editorFormat === "richtext" ? (
                        <div className="p-3 richtext-editor"><EditorContent editor={editor} /></div>
                      ) : (
                        <textarea className="form-control border-0 rounded-0 p-3 h-100 shadow-none markdown-textarea" style={{ minHeight: "250px", resize: "none", fontFamily: "'Fira Code', 'Courier New', monospace", backgroundColor: "var(--card-bg)", color: "var(--text-color)" }} placeholder="Type your markdown here... (e.g. **bold**, # Heading, - list)" value={form.description} onChange={handleMarkdownChange}></textarea>
                      )}
                    </div>
                  </div>
                  {fieldErrors.description && <small className="text-danger mt-1 d-block">{fieldErrors.description}</small>}
                  <div className="mt-2 text-muted small d-flex align-items-center gap-2">
                    <i className="bi bi-info-circle-fill text-info"></i>
                    <span>Tip: You can use Markdown shortcuts directly for formatting.</span>
                  </div>
                </div>

                <div className="mb-5">
                  <div className={`upload-container border border-2 border-dashed rounded-4 p-4 text-center ${fieldErrors.files ? "border-danger bg-danger bg-opacity-10" : "stat-card-adaptive"}`} onClick={() => fileInputRef.current.click()} style={{ cursor: "pointer", borderColor: fieldErrors.files ? "#dc3545" : "var(--border-color)" }}>
                    <div className={`bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`} style={{ width: "50px", height: "50px" }}>
                      <i className="bi bi-cloud-arrow-up-fill text-primary fs-4"></i>
                    </div>
                    <h6 className="fw-bold mb-1">Attach Files <span className="text-danger fw-bold">(Mandatory)</span></h6>
                    <p className="small text-muted mb-3">Attach files or take a photo • Max 5 files • Images, PDF, Video up to 10MB each</p>

                    <button type="button" className="btn btn-outline-primary btn-sm px-4 rounded-pill" onClick={(e) => { e.stopPropagation(); setShowUploadModal(true); }}>
                      <i className="bi bi-paperclip me-2"></i>Choose Files
                    </button>

                    <input type="file" multiple hidden accept="image/*,application/pdf,video/*" ref={fileInputRef} onChange={handleFileChange} />
                    <input type="file" hidden accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} />
                  </div>

                  {/* Selection Modal */}
                  {showUploadModal && (
                    <div className="custom-modal-overlay d-flex align-items-center justify-content-center" onClick={() => setShowUploadModal(false)} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
                      <div className="card border-0 shadow-lg rounded-4 p-4 text-center animate-up" onClick={e => e.stopPropagation()} style={{ width: "90%", maxWidth: "400px" }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="fw-bold mb-0">Select Option</h5>
                          <button type="button" className="btn-close" onClick={() => setShowUploadModal(false)}></button>
                        </div>
                        <div className="row g-3">
                          <div className="col-6">
                            <button type="button" className="btn btn-light border w-100 h-100 py-4 rounded-4 d-flex flex-column align-items-center gap-2 hover-primary" onClick={() => { cameraInputRef.current.click(); setShowUploadModal(false); }}>
                              <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-1" style={{ width: "60px", height: "60px" }}>
                                <i className="bi bi-camera text-info fs-2"></i>
                              </div>
                              <span className="fw-bold small">Camera</span>
                            </button>
                          </div>
                          <div className="col-6">
                            <button type="button" className="btn btn-light border w-100 h-100 py-4 rounded-4 d-flex flex-column align-items-center gap-2 hover-primary" onClick={() => { fileInputRef.current.click(); setShowUploadModal(false); }}>
                              <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-1" style={{ width: "60px", height: "60px" }}>
                                <i className="bi bi-folder2-open text-primary fs-2"></i>
                              </div>
                              <span className="fw-bold small">Files</span>
                            </button>
                          </div>
                        </div>
                        <p className="small text-muted mt-4 mb-0">Choose whether to take a new photo or upload an existing file</p>
                      </div>
                    </div>
                  )}
                  {fieldErrors.files && <small className="text-danger mt-1 d-block text-center">{fieldErrors.files}</small>}

                  {files.length > 0 && (
                    <div className="mt-3 d-flex flex-wrap gap-2">
                      {files.map((file, index) => {
                        let iconClass = "bi-file-earmark-text";
                        if (file.type.startsWith("image/")) iconClass = "bi-image";
                        else if (file.type === "application/pdf") iconClass = "bi-file-earmark-pdf";
                        else if (file.type.startsWith("video/")) iconClass = "bi-play-btn";

                        return (
                          <div key={index} className="badge border text-dark p-2 d-flex align-items-center gap-2 rounded-3 shadow-sm" style={{ backgroundColor: "var(--stat-card-bg)", color: "var(--text-color) !important" }}>
                            <i className={`bi ${iconClass} text-primary`}></i>
                            <span className="fw-normal">{file.name.length > 20 ? file.name.slice(0, 17) + "..." : file.name}</span>
                            <i className="bi bi-x-circle-fill text-danger cursor-pointer" onClick={(e) => { e.stopPropagation(); removeFile(index); }}></i>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <button type="submit" className="btn px-4 py-2 fw-bold rounded-3 shadow-sm mb-3 text-white"
                    style={{ backgroundColor: "#0b5299", border: "none" }}
                    disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-send-fill me-2"></i>}
                    Submit Ticket
                  </button>
                  {/* <p className="small text-muted">We'll get back to you within 24 hours</p> */}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .input-group:focus-within {
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
          border-radius: 0.375rem;
        }
        .input-group-text, .form-control, .form-select { border-color: var(--border-color); color: var(--text-color); }
        .form-control:focus, .form-select:focus { border-color: var(--primary-color); box-shadow: none; color: var(--text-color); }
        /* Make disabled inputs look same as active for cohesive input-group */
        .form-control:disabled, .form-control[readonly] { background-color: var(--stat-card-bg); opacity: 1; }
        .min-vh-20 .ProseMirror:focus { outline: none; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: "Describe the issue in detail...";
          float: left; color: #adb5bd; pointer-events: none; height: 0;
        }
        .cursor-pointer { cursor: pointer; }
        .markdown-textarea:focus { background-color: white !important; }
        .animate-up { animation: modalUp 0.3s ease-out; }
        @keyframes modalUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .hover-primary:hover { border-color: #0b5299 !important; background-color: #f0f7ff !important; }
      `}</style>
    </div>
  );
};

export default GenerateTicket;
