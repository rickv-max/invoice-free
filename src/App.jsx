import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  FileText, 
  User, 
  Briefcase, 
  Image as ImageIcon,
  Settings,
  Wallet,
  Eye,
  PenTool,
  CheckCircle,
  CreditCard
} from 'lucide-react';

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [mobileTab, setMobileTab] = useState('form'); // 'form' or 'preview'

  // State inisialisasi murni tanpa data dummy
  const [invoiceData, setInvoiceData] = useState({
    logo: null,
    invoiceNumber: '',
    date: '',
    status: 'Belum Lunas',
    provider: { name: '', contact: '' },
    client: { name: '', institution: '', contact: '' },
    services: [{ id: crypto.randomUUID(), description: '', price: '' }],
    dp: '',
    paymentInfo: '',
    notes: ''
  });

  // Load html2pdf
  useEffect(() => {
    const loadScript = async () => {
      if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.async = true;
        document.body.appendChild(script);
      }
      setTimeout(() => setIsAppLoading(false), 1500); // Skeleton screen effect
    };
    loadScript();
  }, []);

  // Handlers
  const handleChange = (field, value) => setInvoiceData(prev => ({ ...prev, [field]: value }));
  const handleNestedChange = (section, field, value) => {
    setInvoiceData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };
  const handleServiceChange = (id, field, value) => {
    setInvoiceData(prev => ({
      ...prev, services: prev.services.map(srv => srv.id === id ? { ...srv, [field]: value } : srv)
    }));
  };
  const addService = () => {
    setInvoiceData(prev => ({
      ...prev, services: [...prev.services, { id: crypto.randomUUID(), description: '', price: '' }]
    }));
  };
  const removeService = (id) => {
    if (invoiceData.services.length <= 1) return;
    setInvoiceData(prev => ({ ...prev, services: prev.services.filter(srv => srv.id !== id) }));
  };
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setInvoiceData(prev => ({ ...prev, logo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // Calculations
  const totalAmount = invoiceData.services.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
  const dpAmount = parseFloat(invoiceData.dp) || 0;
  const remainingAmount = totalAmount - dpAmount;

  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // PDF Generator Engine - Highly Optimized for Mobile & Desktop
  const downloadPDF = () => {
    if (!window.html2pdf) return alert("Sistem sedang menyiapkan PDF renderer, silakan tunggu sesaat.");
    
    setIsGeneratingPdf(true);
    const element = document.getElementById('pdf-render-target');
    
    const opt = {
      margin:       0,
      filename:     `Invoice_${invoiceData.client.name || 'Client'}_${invoiceData.invoiceNumber || 'New'}.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: true,
        // windowWidth is crucial here to force desktop layout rendering even on mobile
        windowWidth: 800 
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(element).save().then(() => {
      setIsGeneratingPdf(false);
    }).catch((err) => {
      console.error("PDF generation error", err);
      setIsGeneratingPdf(false);
    });
  };

  // UI: Skeleton Loading State
  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] p-4 flex flex-col justify-center items-center">
        <div className="w-full max-w-5xl space-y-8 animate-pulse">
          <div className="h-8 w-40 bg-neutral-200 rounded-md mx-auto md:mx-0"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="h-[200px] bg-neutral-100 rounded-2xl"></div>
              <div className="h-[300px] bg-neutral-100 rounded-2xl"></div>
            </div>
            <div className="hidden md:block h-[800px] bg-neutral-100 rounded-2xl border border-neutral-200"></div>
          </div>
        </div>
      </div>
    );
  }

  // --- COMPONENT: THE INVOICE TEMPLATE ---
  // DANGER: Do NOT use responsive Tailwind classes (sm:, md:, lg:) inside this component.
  // It must render identically on a 300px mobile screen and a 1920px monitor to guarantee perfect PDFs.
  // We use strict percentages and fixed flexbox layouts here.
  const DocumentTemplate = ({ isForPrint = false }) => {
    return (
      <div 
        className={`bg-white text-neutral-900 ${!isForPrint ? 'shadow-2xl rounded-xl border border-neutral-200/50' : ''}`}
        style={{ 
          width: '800px', // Fixed Desktop Width
          minHeight: '1131px', // Fixed A4 Aspect Ratio Height
          padding: '80px', // Explicit uniform padding
          boxSizing: 'border-box',
          position: 'relative',
          margin: isForPrint ? '0' : '0 auto'
        }}
      >
        {/* HEADER AREA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
          {/* Logo & Provider Info */}
          <div style={{ width: '50%' }}>
            {invoiceData.logo ? (
              <img src={invoiceData.logo} alt="Logo" style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain', marginBottom: '16px' }} />
            ) : (
              <div style={{ height: '40px', marginBottom: '16px' }}></div>
            )}
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#171717' }}>{invoiceData.provider.name || 'Nama Penyedia Jasa'}</div>
            <div style={{ fontSize: '13px', color: '#525252', marginTop: '4px' }}>{invoiceData.provider.contact}</div>
          </div>

          {/* Invoice Identity */}
          <div style={{ width: '50%', textAlign: 'right' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em', color: '#0a0a0a', margin: '0 0 12px 0' }}>INVOICE</h1>
            
            {/* Status Badge */}
            <div style={{ 
              display: 'inline-block', 
              padding: '6px 16px', 
              borderRadius: '999px', 
              fontSize: '11px', 
              fontWeight: '700', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              marginBottom: '24px',
              border: '1px solid',
              borderColor: invoiceData.status === 'Lunas' ? '#166534' : invoiceData.status === 'DP' ? '#ca8a04' : '#991b1b',
              color: invoiceData.status === 'Lunas' ? '#166534' : invoiceData.status === 'DP' ? '#ca8a04' : '#991b1b',
              backgroundColor: invoiceData.status === 'Lunas' ? '#f0fdf4' : invoiceData.status === 'DP' ? '#fefce8' : '#fef2f2'
            }}>
              {invoiceData.status}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <span style={{ color: '#737373', fontWeight: '500', width: '100px' }}>No. Invoice</span>
                <span style={{ color: '#171717', fontWeight: '600', width: '120px' }}>{invoiceData.invoiceNumber || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <span style={{ color: '#737373', fontWeight: '500', width: '100px' }}>Tanggal</span>
                <span style={{ color: '#171717', fontWeight: '600', width: '120px' }}>{invoiceData.date || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CLIENT INFO */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Ditagihkan Kepada
          </div>
          <div style={{ fontSize: '15px', color: '#171717', lineHeight: '1.5' }}>
            <div style={{ fontWeight: '700', fontSize: '18px', color: '#0a0a0a' }}>{invoiceData.client.name || '-'}</div>
            {invoiceData.client.institution && <div style={{ color: '#525252', marginTop: '2px' }}>{invoiceData.client.institution}</div>}
            {invoiceData.client.contact && <div style={{ color: '#525252', marginTop: '2px' }}>{invoiceData.client.contact}</div>}
          </div>
        </div>

        {/* SERVICES TABLE */}
        <div style={{ marginBottom: '40px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #171717' }}>
                <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '700', color: '#525252', textTransform: 'uppercase', width: '75%' }}>Deskripsi Layanan / Tugas</th>
                <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '700', color: '#525252', textTransform: 'uppercase', textAlign: 'right', width: '25%' }}>Tarif</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.services.map((srv, idx) => (
                <tr key={srv.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '20px 8px', fontSize: '14px', color: '#171717', fontWeight: '500', lineHeight: '1.5' }}>
                    {srv.description || '-'}
                  </td>
                  <td style={{ padding: '20px 8px', fontSize: '14px', color: '#171717', fontWeight: '600', textAlign: 'right', verticalAlign: 'top' }}>
                    {srv.price ? formatIDR(srv.price) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS & CALCULATIONS */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '60px' }}>
          <div style={{ width: '50%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 8px', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#737373' }}>Total Biaya</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#171717' }}>{formatIDR(totalAmount)}</span>
            </div>
            
            {dpAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 8px', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#737373' }}>Uang Muka (DP)</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a' }}>-{formatIDR(dpAmount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 12px', marginTop: '16px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#171717' }}>Sisa Tagihan</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#0a0a0a' }}>{formatIDR(remainingAmount)}</span>
            </div>
          </div>
        </div>

        {/* FOOTER / NOTES */}
        <div style={{ 
          position: 'absolute', 
          bottom: '80px', 
          left: '80px', 
          right: '80px', 
          borderTop: '1px solid #e5e5e5', 
          paddingTop: '32px',
          display: 'flex',
          gap: '40px'
        }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '11px', fontWeight: '700', color: '#171717', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Informasi Pembayaran</h4>
            <p style={{ fontSize: '13px', color: '#525252', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{invoiceData.paymentInfo || '-'}</p>
          </div>
          {invoiceData.notes && (
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '11px', fontWeight: '700', color: '#171717', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Catatan Tambahan</h4>
              <p style={{ fontSize: '13px', color: '#525252', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{invoiceData.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 font-sans selection:bg-neutral-200">
      
      {/* HEADER DESKTOP & MOBILE */}
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-neutral-900 p-2.5 rounded-xl shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Invoice<span className="font-normal text-neutral-400">Pro</span></h1>
        </div>
        
        {/* Desktop Download Button */}
        <button 
          onClick={downloadPDF}
          disabled={isGeneratingPdf}
          className={`hidden md:flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            isGeneratingPdf 
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-md hover:shadow-lg active:scale-95'
          }`}
        >
          {isGeneratingPdf ? <span className="animate-pulse">Menyiapkan Dokumen...</span> : <><Download className="w-4 h-4" /> Unduh PDF</>}
        </button>
      </header>

      {/* MAIN CONTENT AREA */}
      {/* Ensure bottom padding is large enough so mobile nav doesn't hide content */}
      <main className="max-w-[1440px] mx-auto p-4 md:p-8 pb-32 md:pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* LEFT: FORM BUILDER */}
          <div className={`w-full md:w-[45%] lg:w-[40%] space-y-6 ${mobileTab === 'preview' ? 'hidden md:block' : 'block'}`}>
            
            {/* Section 1: Pengaturan Dasar */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-neutral-200/60 transition-shadow hover:shadow-md">
              <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2.5 mb-6">
                <Settings className="w-4 h-4 text-neutral-400" /> Pengaturan Dasar
              </h2>
              
              {/* Upload Logo & Provider Name */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
                {!invoiceData.logo ? (
                  <label className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-neutral-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 hover:border-neutral-400 transition-all group">
                    <ImageIcon className="w-6 h-6 text-neutral-400 group-hover:text-neutral-600 mb-1" />
                    <span className="text-[10px] text-neutral-400 font-medium">Logo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                ) : (
                  <div className="relative w-20 h-20 border border-neutral-200 rounded-2xl p-2 bg-white flex-shrink-0 group">
                    <img src={invoiceData.logo} alt="Logo" className="w-full h-full object-contain" />
                    <button onClick={() => handleChange('logo', null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                <div className="flex-grow w-full space-y-3">
                  <div>
                    <input type="text" placeholder="Nama Penyedia (Cth: Ricky Maulana)" className="w-full text-base font-semibold border-b border-neutral-200 pb-2 focus:border-neutral-900 outline-none transition-colors bg-transparent placeholder:font-normal"
                      value={invoiceData.provider.name} onChange={(e) => handleNestedChange('provider', 'name', e.target.value)} />
                  </div>
                  <div>
                    <input type="text" placeholder="No. HP / Email Anda" className="w-full text-sm text-neutral-600 border-b border-neutral-200 pb-2 focus:border-neutral-900 outline-none transition-colors bg-transparent"
                      value={invoiceData.provider.contact} onChange={(e) => handleNestedChange('provider', 'contact', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Invoice Specifics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">No. Invoice</label>
                  <input type="text" placeholder="INV-001" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all"
                    value={invoiceData.invoiceNumber} onChange={(e) => handleChange('invoiceNumber', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Tanggal</label>
                  <input type="date" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all"
                    value={invoiceData.date} onChange={(e) => handleChange('date', e.target.value)} />
                </div>
              </div>
              
              <div className="mt-4 space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Status Dokumen</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:bg-white focus:border-neutral-900 appearance-none transition-all font-medium"
                    value={invoiceData.status} onChange={(e) => handleChange('status', e.target.value)}
                    style={{ color: invoiceData.status === 'Lunas' ? '#166534' : invoiceData.status === 'DP' ? '#ca8a04' : '#991b1b' }}>
                    <option value="Belum Lunas">Belum Lunas</option>
                    <option value="DP">Dalam Proses / DP</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Data Klien */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-neutral-200/60 transition-shadow hover:shadow-md space-y-4">
              <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2.5 mb-2">
                <User className="w-4 h-4 text-neutral-400" /> Identitas Klien
              </h2>
              <input type="text" placeholder="Nama Klien / Mahasiswa" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400"
                value={invoiceData.client.name} onChange={(e) => handleNestedChange('client', 'name', e.target.value)} />
              <input type="text" placeholder="Instansi / Kampus / Jurusan" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400"
                value={invoiceData.client.institution} onChange={(e) => handleNestedChange('client', 'institution', e.target.value)} />
              <input type="text" placeholder="Nomor WhatsApp / Kontak" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400"
                value={invoiceData.client.contact} onChange={(e) => handleNestedChange('client', 'contact', e.target.value)} />
            </div>

            {/* Section 3: Layanan & Harga */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-neutral-200/60 transition-shadow hover:shadow-md space-y-5">
              <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2.5 mb-2">
                <Briefcase className="w-4 h-4 text-neutral-400" /> Rincian Pekerjaan
              </h2>
              
              <div className="space-y-4">
                {invoiceData.services.map((srv) => (
                  <div key={srv.id} className="flex gap-3 items-start relative group bg-neutral-50/50 p-1.5 rounded-2xl border border-transparent hover:border-neutral-200 transition-colors">
                    <div className="flex-grow space-y-3">
                      <input type="text" placeholder="Deskripsi (Cth: Pembuatan Skripsi Bab 1)" className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all"
                        value={srv.description} onChange={(e) => handleServiceChange(srv.id, 'description', e.target.value)} />
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500 font-medium">Rp</span>
                        <input type="number" placeholder="Tarif Layanan" className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all font-medium"
                          value={srv.price} onChange={(e) => handleServiceChange(srv.id, 'price', e.target.value)} />
                      </div>
                    </div>
                    <button onClick={() => removeService(srv.id)} className="mt-2 p-3 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" aria-label="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <button onClick={addService} className="w-full py-3 border-2 border-dashed border-neutral-200 text-neutral-600 text-sm font-semibold rounded-xl hover:border-neutral-400 hover:bg-neutral-50 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Tambah Baris Pekerjaan
              </button>
            </div>

            {/* Section 4: Pembayaran & DP */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-neutral-200/60 transition-shadow hover:shadow-md space-y-5">
              <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2.5 mb-2">
                <Wallet className="w-4 h-4 text-neutral-400" /> Keuangan & Instruksi
              </h2>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Uang Muka / Telah Dibayar</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-emerald-600 font-semibold">Rp</span>
                  <input type="number" placeholder="Nominal DP (Bila Ada)" className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all font-medium text-emerald-700"
                    value={invoiceData.dp} onChange={(e) => handleChange('dp', e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Instruksi Transfer</label>
                <textarea placeholder="Mohon transfer ke: BCA 123456 a.n Nama Anda" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all resize-none h-24"
                  value={invoiceData.paymentInfo} onChange={(e) => handleChange('paymentInfo', e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Catatan Kaki (Opsional)</label>
                <textarea placeholder="Terima kasih atas kepercayaannya..." className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all resize-none h-16"
                  value={invoiceData.notes} onChange={(e) => handleChange('notes', e.target.value)} />
              </div>
            </div>

          </div>

          {/* RIGHT: LIVE PREVIEW DESKTOP / MOBILE */}
          <div className={`w-full md:w-[55%] lg:w-[60%] flex flex-col items-center ${mobileTab === 'form' ? 'hidden md:flex' : 'flex'}`}>
            <div className="sticky top-28 w-full flex flex-col items-center">
              
              <div className="mb-4 text-xs font-bold tracking-widest text-neutral-400 uppercase flex items-center gap-2">
                <Eye className="w-4 h-4" /> Live Preview
              </div>

              {/* Responsiveness Trick for Perfect A4 Aspect Ratio viewing on any screen */}
              <div className="w-full overflow-x-auto pb-6 custom-scrollbar flex justify-center px-2">
                {/* Scale the visual representation down on small screens, but keep the core logic pure */}
                <div className="origin-top transform scale-[0.42] sm:scale-[0.55] md:scale-[0.55] lg:scale-[0.7] xl:scale-[0.85] transition-transform duration-300 shadow-2xl rounded-xl">
                  <DocumentTemplate isForPrint={false} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION (GLASSMORPHISM) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-white/80 backdrop-blur-xl border border-neutral-200/50 shadow-2xl rounded-2xl px-3 py-3 flex justify-between items-center z-50">
        <div className="flex bg-neutral-100/80 p-1.5 rounded-xl w-[70%] relative">
          <button 
            onClick={() => setMobileTab('form')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-300 z-10 ${mobileTab === 'form' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            <PenTool className="w-4 h-4" /> Editor
          </button>
          <button 
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-300 z-10 ${mobileTab === 'preview' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          {/* Animated Tab Background Indicator */}
          <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-out ${mobileTab === 'preview' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`}></div>
        </div>
        
        {/* Mobile Download Button */}
        <button 
          onClick={downloadPDF}
          disabled={isGeneratingPdf}
          className="bg-neutral-900 text-white p-3.5 rounded-xl shadow-lg shadow-neutral-900/20 active:scale-95 transition-all w-[25%] flex justify-center items-center"
        >
          {isGeneratingPdf ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Download className="w-5 h-5" />}
        </button>
      </div>

      {/* HIDDEN RENDER ENGINE FOR PERFECT PDF GENERATION */}
      {/* Absolute positioning out of viewport ensures html2canvas renders the 800px width correctly without breaking the main layout */}
      <div style={{ position: 'absolute', top: '-15000px', left: '-15000px', pointerEvents: 'none' }}>
        <div id="pdf-render-target">
          <DocumentTemplate isForPrint={true} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        
        /* Hide scrollbar for clean mobile experience on main window */
        @media (max-width: 768px) {
           body { padding-bottom: 20px; }
        }
      `}} />
    </div>
  );
}

