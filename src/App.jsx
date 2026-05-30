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
  PenTool
} from 'lucide-react';

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [mobileTab, setMobileTab] = useState('form');

  // Strict initial state - No dummy data
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

  // Dynamic Scaling Hook for Perfect Mobile Preview
  const previewContainerRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const parentWidth = previewContainerRef.current.parentElement.offsetWidth - 32;
        const newScale = parentWidth / 800; // 800 is the fixed A4 wrapper width
        setPreviewScale(newScale < 1 ? newScale : 1);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [mobileTab]);

  useEffect(() => {
    const loadScript = async () => {
      if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.async = true;
        document.body.appendChild(script);
      }
      setTimeout(() => setIsAppLoading(false), 800);
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
    }).format(amount || 0).replace('Rp', 'Rp ');
  };

  // PDF Engine 
  const downloadPDF = () => {
    if (!window.html2pdf) return alert("Sistem rendering sedang dimuat, mohon tunggu sebentar.");
    
    setIsGeneratingPdf(true);
    const element = document.getElementById('pdf-render-target');
    
    const opt = {
      margin:       0,
      filename:     `Invoice_${invoiceData.client.name || 'Joki'}_${invoiceData.invoiceNumber || 'New'}.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        width: 800,
        height: 1131,
        windowWidth: 800,
        windowHeight: 1131,
        scrollY: 0,
        scrollX: 0,
        x: 0,
        y: 0
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    element.style.opacity = '1';
    element.style.zIndex = '-9999';

    window.html2pdf().set(opt).from(element).save().then(() => {
      element.style.opacity = '0.001';
      setIsGeneratingPdf(false);
    }).catch((err) => {
      console.error(err);
      element.style.opacity = '0.001';
      setIsGeneratingPdf(false);
    });
  };

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-8 animate-pulse">
          <div className="h-8 w-48 bg-neutral-200 rounded-lg"></div>
          <div className="grid md:grid-cols-2 gap-8">
             <div className="h-[600px] bg-neutral-100 rounded-3xl"></div>
             <div className="h-[800px] bg-neutral-100 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // --- COMPACT & TIGHT DOCUMENT TEMPLATE ---
  // Redesigned to be highly dense and professional. White space is heavily reduced.
  const DocumentTemplate = () => {
    return (
      <div style={{ 
        width: '800px', 
        height: '1131px', // Fixed A4 Aspect Ratio height
        padding: '50px 60px', // Reduced padding from 70px to bring content closer to edges
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#171717',
        fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
        position: 'relative'
      }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div style={{ width: '55%' }}>
            {invoiceData.logo ? (
              <img src={invoiceData.logo} alt="Logo" style={{ maxHeight: '56px', maxWidth: '180px', objectFit: 'contain', marginBottom: '12px' }} />
            ) : (
              <div style={{ height: '16px', marginBottom: '12px' }}></div> 
            )}
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0a0a0a', letterSpacing: '-0.01em', marginBottom: '2px' }}>
              {invoiceData.provider.name || 'Nama Penyedia Jasa'}
            </div>
            <div style={{ fontSize: '12px', color: '#525252', fontWeight: '500' }}>
              {invoiceData.provider.contact}
            </div>
          </div>

          <div style={{ width: '45%', textAlign: 'right' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em', color: '#0a0a0a', margin: '0 0 8px 0' }}>INVOICE</h1>
            
            <div style={{ 
              display: 'inline-block', 
              padding: '4px 12px', 
              borderRadius: '6px', 
              fontSize: '10px', 
              fontWeight: '800', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              marginBottom: '16px',
              border: '1px solid',
              borderColor: invoiceData.status === 'Lunas' ? '#166534' : invoiceData.status === 'DP' ? '#ca8a04' : '#991b1b',
              color: invoiceData.status === 'Lunas' ? '#166534' : invoiceData.status === 'DP' ? '#ca8a04' : '#991b1b',
              backgroundColor: invoiceData.status === 'Lunas' ? '#f0fdf4' : invoiceData.status === 'DP' ? '#fefce8' : '#fef2f2'
            }}>
              {invoiceData.status}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <span style={{ color: '#737373', fontWeight: '600' }}>No. Invoice</span>
                <span style={{ color: '#171717', fontWeight: '700', width: '100px' }}>{invoiceData.invoiceNumber || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <span style={{ color: '#737373', fontWeight: '600' }}>Tanggal</span>
                <span style={{ color: '#171717', fontWeight: '700', width: '100px' }}>{invoiceData.date || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CLIENT INFO */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '2px solid #f5f5f5' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Ditagihkan Kepada
          </div>
          <div style={{ fontSize: '13px', color: '#262626', lineHeight: '1.5' }}>
            <div style={{ fontWeight: '800', fontSize: '16px', color: '#0a0a0a', marginBottom: '2px' }}>{invoiceData.client.name || '-'}</div>
            {invoiceData.client.institution && <div style={{ fontWeight: '500' }}>{invoiceData.client.institution}</div>}
            {invoiceData.client.contact && <div style={{ color: '#525252' }}>{invoiceData.client.contact}</div>}
          </div>
        </div>

        {/* SERVICES TABLE (Highly Compact) */}
        <div style={{ marginBottom: '24px', minHeight: '200px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #171717' }}>
                <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: '800', color: '#525252', textTransform: 'uppercase', width: '75%', letterSpacing: '0.02em', backgroundColor: '#fafafa' }}>Deskripsi Layanan & Pekerjaan</th>
                <th style={{ padding: '8px 8px', fontSize: '11px', fontWeight: '800', color: '#525252', textTransform: 'uppercase', textAlign: 'right', width: '25%', letterSpacing: '0.02em', backgroundColor: '#fafafa' }}>Tarif</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.services.map((srv, idx) => (
                <tr key={srv.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 8px', fontSize: '13px', color: '#171717', fontWeight: '500', lineHeight: '1.5' }}>
                    {srv.description || '-'}
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: '13px', color: '#171717', fontWeight: '700', textAlign: 'right', verticalAlign: 'top' }}>
                    {srv.price ? formatIDR(srv.price) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS & CALCULATIONS */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <div style={{ width: '50%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#737373' }}>Total Biaya</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#171717' }}>{formatIDR(totalAmount)}</span>
            </div>
            
            {dpAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#737373' }}>Telah Dibayar / DP</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a' }}>-{formatIDR(dpAmount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', marginTop: '12px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#171717' }}>Sisa Tagihan</span>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#0a0a0a' }}>{formatIDR(remainingAmount)}</span>
            </div>
          </div>
        </div>

        {/* FOOTER / NOTES (Compact) */}
        <div style={{ 
          position: 'absolute', 
          bottom: '50px', // Raised to match padding
          left: '60px', 
          right: '60px', 
          borderTop: '1px solid #e5e5e5', 
          paddingTop: '20px',
          display: 'flex',
          gap: '32px'
        }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '10px', fontWeight: '800', color: '#171717', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Informasi Pembayaran</h4>
            <p style={{ fontSize: '12px', color: '#525252', whiteSpace: 'pre-wrap', lineHeight: '1.5', fontWeight: '500' }}>{invoiceData.paymentInfo || '-'}</p>
          </div>
          {invoiceData.notes && (
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '10px', fontWeight: '800', color: '#171717', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Catatan Tambahan</h4>
              <p style={{ fontSize: '12px', color: '#525252', whiteSpace: 'pre-wrap', lineHeight: '1.5', fontWeight: '500' }}>{invoiceData.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 font-sans selection:bg-neutral-200">
      
      {/* HEADER DESKTOP & MOBILE */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-neutral-200/60 sticky top-0 z-50 px-5 md:px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-neutral-900 p-2.5 rounded-xl shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Invoice<span className="font-normal text-neutral-400">Joki</span></h1>
        </div>
        
        <button 
          onClick={downloadPDF}
          disabled={isGeneratingPdf}
          className={`hidden md:flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
            isGeneratingPdf 
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-md hover:shadow-xl hover:-translate-y-0.5'
          }`}
        >
          {isGeneratingPdf ? <span className="animate-pulse">Memproses...</span> : <><Download className="w-4 h-4" /> Unduh PDF</>}
        </button>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-[1440px] mx-auto p-4 md:p-8 pb-32 md:pb-12">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          
          {/* LEFT: FORM BUILDER */}
          <div className={`w-full md:w-[45%] lg:w-[40%] space-y-6 md:space-y-8 ${mobileTab === 'preview' ? 'hidden md:block' : 'block'}`}>
            
            {/* Section 1: Pengaturan Dasar */}
            <div className="bg-white p-5 md:p-7 rounded-3xl shadow-sm border border-neutral-200/50">
              <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2.5 mb-5">
                <Settings className="w-4 h-4 text-neutral-400" /> Profil Penyedia
              </h2>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-5">
                {!invoiceData.logo ? (
                  <label className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-neutral-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 hover:border-neutral-400 transition-all group">
                    <ImageIcon className="w-6 h-6 text-neutral-400 group-hover:text-neutral-600 mb-1" />
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Logo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                ) : (
                  <div className="relative w-20 h-20 border border-neutral-200 rounded-2xl p-2 bg-white flex-shrink-0 group">
                    <img src={invoiceData.logo} alt="Logo" className="w-full h-full object-contain" />
                    <button onClick={() => handleChange('logo', null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                <div className="flex-grow w-full space-y-3">
                  <div>
                    <input type="text" placeholder="Nama Anda / Tim (Cth: Joki Skripsi)" className="w-full text-base font-bold border-b-2 border-neutral-100 pb-2 focus:border-neutral-900 outline-none transition-colors bg-transparent placeholder:font-normal placeholder:text-neutral-400"
                      value={invoiceData.provider.name} onChange={(e) => handleNestedChange('provider', 'name', e.target.value)} />
                  </div>
                  <div>
                    <input type="text" placeholder="Nomor Telepon / Email" className="w-full text-sm font-medium text-neutral-700 border-b-2 border-neutral-100 pb-2 focus:border-neutral-900 outline-none transition-colors bg-transparent placeholder:font-normal placeholder:text-neutral-400"
                      value={invoiceData.provider.contact} onChange={(e) => handleNestedChange('provider', 'contact', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">No. Invoice</label>
                  <input type="text" placeholder="INV-001" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all font-medium"
                    value={invoiceData.invoiceNumber} onChange={(e) => handleChange('invoiceNumber', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Tanggal</label>
                  <input type="date" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all font-medium"
                    value={invoiceData.date} onChange={(e) => handleChange('date', e.target.value)} />
                </div>
              </div>
              
              <div className="mt-4 space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Status Pembayaran</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 appearance-none transition-all font-bold"
                    value={invoiceData.status} onChange={(e) => handleChange('status', e.target.value)}
                    style={{ color: invoiceData.status === 'Lunas' ? '#166534' : invoiceData.status === 'DP' ? '#ca8a04' : '#991b1b' }}>
                    <option value="Belum Lunas">Belum Lunas</option>
                    <option value="DP">Dalam Proses / DP</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Data Klien */}
            <div className="bg-white p-5 md:p-7 rounded-3xl shadow-sm border border-neutral-200/50 space-y-3.5">
              <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2.5 mb-2">
                <User className="w-4 h-4 text-neutral-400" /> Identitas Mahasiswa / Klien
              </h2>
              <input type="text" placeholder="Nama Klien" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all font-medium"
                value={invoiceData.client.name} onChange={(e) => handleNestedChange('client', 'name', e.target.value)} />
              <input type="text" placeholder="Universitas / Kampus / Jurusan" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all font-medium"
                value={invoiceData.client.institution} onChange={(e) => handleNestedChange('client', 'institution', e.target.value)} />
              <input type="text" placeholder="Nomor WhatsApp" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all font-medium"
                value={invoiceData.client.contact} onChange={(e) => handleNestedChange('client', 'contact', e.target.value)} />
            </div>

            {/* Section 3: Layanan & Harga */}
            <div className="bg-white p-5 md:p-7 rounded-3xl shadow-sm border border-neutral-200/50 space-y-4">
              <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2.5 mb-2">
                <Briefcase className="w-4 h-4 text-neutral-400" /> Rincian Pekerjaan
              </h2>
              
              <div className="space-y-3">
                {invoiceData.services.map((srv) => (
                  <div key={srv.id} className="flex gap-2 items-start bg-neutral-50 p-2 rounded-2xl border border-neutral-100">
                    <div className="flex-grow space-y-2.5">
                      <input type="text" placeholder="Deskripsi Tugas (Cth: Bab 1)" className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none font-medium"
                        value={srv.description} onChange={(e) => handleServiceChange(srv.id, 'description', e.target.value)} />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 font-bold">Rp</span>
                        <input type="number" placeholder="Tarif" className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none font-bold text-neutral-800"
                          value={srv.price} onChange={(e) => handleServiceChange(srv.id, 'price', e.target.value)} />
                      </div>
                    </div>
                    <button onClick={() => removeService(srv.id)} className="mt-1 p-2.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <button onClick={addService} className="w-full py-3 border-2 border-dashed border-neutral-200/80 text-neutral-600 text-sm font-bold rounded-xl hover:border-neutral-400 hover:bg-neutral-50 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Tambah Baris
              </button>
            </div>

            {/* Section 4: Pembayaran */}
            <div className="bg-white p-5 md:p-7 rounded-3xl shadow-sm border border-neutral-200/50 space-y-4">
              <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2.5 mb-2">
                <Wallet className="w-4 h-4 text-neutral-400" /> Keuangan & Instruksi
              </h2>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Telah Dibayar / DP</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-emerald-600 font-bold">Rp</span>
                  <input type="number" placeholder="Nominal Uang Muka" className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-600 outline-none font-bold text-emerald-700"
                    value={invoiceData.dp} onChange={(e) => handleChange('dp', e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Instruksi Transfer</label>
                <textarea placeholder="Transfer: SeaBank 90118392 a.n Budi" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none resize-none h-20 font-medium"
                  value={invoiceData.paymentInfo} onChange={(e) => handleChange('paymentInfo', e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Catatan Kaki</label>
                <textarea placeholder="Terima kasih..." className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200/80 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none resize-none h-16 font-medium"
                  value={invoiceData.notes} onChange={(e) => handleChange('notes', e.target.value)} />
              </div>
            </div>

          </div>

          {/* RIGHT: LIVE PREVIEW DESKTOP / MOBILE */}
          <div className={`w-full md:w-[55%] lg:w-[60%] flex flex-col items-center ${mobileTab === 'form' ? 'hidden md:flex' : 'flex'}`}>
            <div className="sticky top-28 w-full flex flex-col items-center" ref={previewContainerRef}>
              
              <div className="mb-5 px-4 py-1.5 bg-neutral-200/50 rounded-full text-[10px] font-bold tracking-widest text-neutral-500 uppercase flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" /> Live Preview
              </div>

              {/* Dynamic Scaling Wrapper */}
              <div 
                className="w-full flex justify-center overflow-visible"
                style={{
                  height: `${1131 * previewScale}px`, 
                  transition: 'height 0.2s ease-out'
                }}
              >
                <div 
                  className="shadow-2xl rounded-sm md:rounded-xl overflow-hidden ring-1 ring-neutral-200"
                  style={{
                    width: '800px',
                    height: '1131px',
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top center',
                    willChange: 'transform'
                  }}
                >
                  <DocumentTemplate />
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION (PREMIUM GLASSMORPHISM) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] bg-white/90 backdrop-blur-xl border border-neutral-200/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl px-2.5 py-2.5 flex justify-between items-center z-50">
        <div className="flex bg-neutral-100/80 p-1.5 rounded-xl w-[70%] relative">
          <button 
            onClick={() => setMobileTab('form')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all duration-300 z-10 ${mobileTab === 'form' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            <PenTool className="w-4 h-4" /> Form
          </button>
          <button 
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all duration-300 z-10 ${mobileTab === 'preview' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            <Eye className="w-4 h-4" /> Cek Hasil
          </button>
          <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-lg shadow-sm transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${mobileTab === 'preview' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`}></div>
        </div>
        
        <button 
          onClick={downloadPDF}
          disabled={isGeneratingPdf}
          className="bg-neutral-900 text-white p-3.5 rounded-xl shadow-lg shadow-neutral-900/20 active:scale-95 transition-all w-[26%] flex justify-center items-center"
        >
          {isGeneratingPdf ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Download className="w-5 h-5" />}
        </button>
      </div>

      {/* ABSOLUTE PDF RENDER TARGET */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        zIndex: -9999, 
        opacity: 0.001, 
        pointerEvents: 'none' 
      }}>
        <div id="pdf-render-target">
          <DocumentTemplate />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        body { overflow-x: hidden; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}} />
    </div>
  );
}

