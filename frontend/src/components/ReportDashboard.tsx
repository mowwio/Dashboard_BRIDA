import { useEffect, useState } from 'react'; // useEffect digunakan untuk trigger PDF generation
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '/images/logo-brida-jatim.png';


interface ReportDashboardProps {
  onClose: () => void;
  trendData: any[];
  maturityTrendData: any[];
  topOPD: any[];
  topUrusan: any[];
  stats: any;
  aiInsights: any[];
  selectedYear: 'all' | number;
  selectedYearMaturity: 'all' | number;
}

export function ReportDashboard({
  onClose,
  trendData,
  maturityTrendData,
  topOPD,
  topUrusan,
  stats,
  aiInsights,
  selectedYear,
  selectedYearMaturity,
}: ReportDashboardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading] = useState(false); // data sudah tersedia dari props
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Menyiapkan laporan...');

  useEffect(() => {
    if (isLoading) return;

    const generatePDF = async () => {
      try {
        setIsGenerating(true);
        setProgress(10);
        setStatusMessage('Memuat komponen...');

        await new Promise(resolve => setTimeout(resolve, 1500));

        setProgress(30);
        setStatusMessage('Menunggu grafik selesai dirender...');

        await new Promise(resolve => setTimeout(resolve, 2000));

        setProgress(50);
        setStatusMessage('Memverifikasi elemen visual...');

        const page1 = document.getElementById('report-page-1');
        const page2 = document.getElementById('report-page-2');

        if (!page1 || !page2) {
          alert('Error: Konten laporan tidak ditemukan');
          onClose();
          return;
        }

        setProgress(60);
        setStatusMessage('Membuat screenshot halaman 1...');

        await new Promise(resolve => setTimeout(resolve, 300));

        const canvas1 = await html2canvas(page1, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        setProgress(75);
        setStatusMessage('Membuat screenshot halaman 2...');

        await new Promise(resolve => setTimeout(resolve, 300));

        const canvas2 = await html2canvas(page2, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        setProgress(85);
        setStatusMessage('Mengkonversi ke PDF...');

        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Page 1
        const imgData1 = canvas1.toDataURL('image/png', 1.0);
        const imgWidth1 = pdfWidth;
        const imgHeight1 = (canvas1.height * pdfWidth) / canvas1.width;
        pdf.addImage(imgData1, 'PNG', 0, 0, imgWidth1, imgHeight1);

        // Page 2
        pdf.addPage();
        const imgData2 = canvas2.toDataURL('image/png', 1.0);
        const imgWidth2 = pdfWidth;
        const imgHeight2 = (canvas2.height * pdfWidth) / canvas2.width;
        pdf.addImage(imgData2, 'PNG', 0, 0, imgWidth2, imgHeight2);

        setProgress(95);
        setStatusMessage('Menyimpan file...');

        const fileName = `Laporan_Dashboard_BRIDA_${Date.now()}.pdf`;
        pdf.save(fileName);

        setProgress(100);
        setStatusMessage('PDF berhasil dibuat!');

        setTimeout(() => {
          onClose();
        }, 1500);

      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Gagal membuat PDF. Silakan coba lagi.');
        onClose();
      } finally {
        setIsGenerating(false);
      }
    };

    generatePDF();
  }, [isLoading, onClose]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', textAlign: 'center' }}>
          {isLoading ? 'Memuat Data...' : isGenerating ? 'Membuat PDF...' : 'PDF Siap!'}
        </h3>
        <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '12px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{
            width: isLoading ? '50%' : `${progress}%`,
            height: '100%',
            backgroundColor: '#3b82f6',
            transition: 'width 0.3s ease-in-out'
          }} />
        </div>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
          {statusMessage}
        </p>
      </div>

      {/* Hidden Report Content */}
      {!isLoading && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          {/* PAGE 1 */}
          <div id="report-page-1" style={{
            width: '297mm',
            height: '210mm',
            backgroundColor: 'white',
            padding: '20mm',
            fontFamily: 'Arial, sans-serif',
            color: '#000000',
            position: 'relative',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '4px solid #2563EB',
              gap: '20px'
            }}>
              <div style={{
                width: '90px',
                height: '90px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '8px',
                flexShrink: 0
              }}>
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0,
                  marginBottom: '6px',
                  lineHeight: '1.2'
                }}>
                  Laporan Dashboard Inovasi BRIDA Jawa Timur
                </h1>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                  Tanggal Generate: {new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })} | Filter: {selectedYear === 'all' ? 'Semua Tahun' : `Tahun ${selectedYear}`} | Halaman 1 dari 2
                </p>
              </div>
            </div>

            {/* Ringkasan Statistik Inovasi */}
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#0F172A',
                margin: 0,
                marginBottom: '10px'
              }}>
                Ringkasan Statistik Inovasi
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {/* Total Inovasi */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>📈 Total Inovasi</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937' }}>{stats.total_inovasi}</div>
                </div>
                {/* Rata-rata Kematangan */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>🏆 Rata-rata Kematangan</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937' }}>{stats.rata_kematangan}</div>
                </div>
                {/* Inovasi Digital */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>✨ Inovasi Digital</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937' }}>{stats.inovasi_digital}</div>
                </div>
                {/* Inovasi Baru Tahun Ini */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>📅 Inovasi Baru Tahun Ini</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937' }}>{stats.inovasi_tahun_ini}</div>
                </div>
              </div>
            </div>

            {/* Analisis Data Inovasi */}
            <div style={{ marginBottom: '12px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#0F172A',
                margin: 0,
                marginBottom: '10px'
              }}>
                Analisis Data Inovasi
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Tren Penerapan Inovasi Per Tahun */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}>
                  <h3 style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: 0,
                    marginBottom: '8px'
                  }}>
                    {selectedYear === 'all'
                      ? 'Tren Jenis Inovasi Per Tahun'
                      : `Tren Jenis Inovasi Per Bulan (${selectedYear})`}
                  </h3>
                  <div style={{ width: '100%', height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey={selectedYear === 'all' ? 'tahun' : 'bulan'}
                          stroke="#6b7280"
                          style={{ fontSize: '10px' }}
                          label={{
                            value: selectedYear === 'all' ? 'Tahun' : 'Bulan',
                            position: 'insideBottom',
                            offset: -10,
                            fill: '#6b7280',
                            style: { fontSize: '10px' }
                          }}
                        />
                        <YAxis
                          stroke="#6b7280"
                          style={{ fontSize: '10px' }}
                          label={{
                            value: 'Jumlah Inovasi',
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#6b7280',
                            style: { fontSize: '10px', textAnchor: 'middle' }
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            fontSize: '10px'
                          }}
                        />
                        <Line type="monotone" dataKey="digital" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 4 }} name="Digital" />
                        <Line type="monotone" dataKey="nondigital" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} name="Non-Digital" />
                        <Line type="monotone" dataKey="teknologi" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }} name="Teknologi" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tren Tahapan Inovasi */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}>
                  <h3 style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: 0,
                    marginBottom: '8px'
                  }}>
                    {selectedYearMaturity === 'all'
                      ? 'Tren Tahapan Inovasi Per Tahun'
                      : `Tren Tahapan Inovasi Per Bulan (${selectedYearMaturity})`}
                  </h3>
                  <div style={{ width: '100%', height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={maturityTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey={selectedYearMaturity === 'all' ? 'tahun' : 'bulan'}
                          stroke="#6b7280"
                          style={{ fontSize: '10px' }}
                          label={{
                            value: selectedYearMaturity === 'all' ? 'Tahun' : 'Bulan',
                            position: 'insideBottom',
                            offset: -10,
                            fill: '#6b7280',
                            style: { fontSize: '10px' }
                          }}
                        />
                        <YAxis
                          stroke="#6b7280"
                          style={{ fontSize: '10px' }}
                          label={{
                            value: 'Jumlah Inovasi',
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#6b7280',
                            style: { fontSize: '10px', textAnchor: 'middle' }
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            fontSize: '10px'
                          }}
                        />
                        <Line type="monotone" dataKey="penerapan" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 4 }} name="Penerapan" />
                        <Line type="monotone" dataKey="inisiatif" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} name="Inisiatif" />
                        <Line type="monotone" dataKey="ujicoba"   stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }} name="Uji Coba" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: 'auto',
              paddingTop: '12px',
              borderTop: '3px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#1f2937', margin: 0, marginBottom: '4px' }}>
                BADAN RISET DAN INOVASI DAERAH PROVINSI JAWA TIMUR
              </p>
              <p style={{ fontSize: '9px', color: '#6b7280', margin: 0, lineHeight: '1.4' }}>
                Jl. Gayung Kebonsari No.56, Gayungan, Kec. Gayungan, Surabaya, Jawa Timur 60235 <br /> Email: brida@jatimprov.go.id | Website: brida.jatimprov.go.id
              </p>
            </div>
          </div>

          {/* PAGE 2 */}
          <div id="report-page-2" style={{
            width: '297mm',
            height: '210mm',
            backgroundColor: 'white',
            padding: '20mm',
            fontFamily: 'Arial, sans-serif',
            color: '#000000',
            position: 'relative',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              paddingBottom: '12px',
              borderBottom: '4px solid #2563EB',
              gap: '20px'
            }}>
              <div style={{
                width: '90px',
                height: '90px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '8px',
                flexShrink: 0
              }}>
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0,
                  marginBottom: '6px',
                  lineHeight: '1.2'
                }}>
                  Laporan Dashboard Inovasi BRIDA Jawa Timur
                </h1>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                  Tanggal Generate: {new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })} | Filter: {selectedYear === 'all' ? 'Semua Tahun' : `Tahun ${selectedYear}`} | Halaman 2 dari 2
                </p>
              </div>
            </div>

            {/* Top OPD dan Top Urusan */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Top OPD */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}>
                  <h3 style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: 0,
                    marginBottom: '8px'
                  }}>
                    Top 5 OPD Berdasarkan Jumlah Inovasi
                  </h3>
                  <div style={{ width: '100%', height: '210px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topOPD} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          type="number"
                          stroke="#6b7280"
                          style={{ fontSize: '10px' }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          stroke="#6b7280"
                          width={160}
                          style={{ fontSize: '9px' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            fontSize: '10px'
                          }}
                        />
                        <Bar dataKey="jumlah" radius={[0, 8, 8, 0]}>
                          {topOPD.map((entry, index) => {
                            const maxValue = Math.max(...topOPD.map(d => d.jumlah));
                            return (
                              <Cell
                                key={`cell-opd-${index}`}
                                fill={entry.jumlah === maxValue ? '#2563EB' : '#9CA3AF'}
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Urusan */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}>
                  <h3 style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: 0,
                    marginBottom: '8px'
                  }}>
                    Top 5 Urusan Berdasarkan Jumlah Inovasi
                  </h3>
                  <div style={{ width: '100%', height: '210px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topUrusan} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          type="number"
                          stroke="#6b7280"
                          style={{ fontSize: '10px' }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          stroke="#6b7280"
                          width={160}
                          style={{ fontSize: '9px' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            fontSize: '10px'
                          }}
                        />
                        <Bar dataKey="jumlah" radius={[0, 8, 8, 0]}>
                          {topUrusan.map((entry, index) => {
                            const maxValue = Math.max(...topUrusan.map(d => d.jumlah));
                            return (
                              <Cell
                                key={`cell-urusan-${index}`}
                                fill={entry.jumlah === maxValue ? '#2563EB' : '#9CA3AF'}
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Auto Insight */}
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0,
                marginBottom: '8px',
                paddingLeft: '10px',
                borderLeft: '4px solid #2563EB'
              }}>
                AI Auto Insight
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}>
                {aiInsights.slice(0, 5).map((insight, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '10px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      borderLeft: `4px solid ${
                        insight.type === 'success'
                          ? '#10B981'
                          : insight.type === 'warning'
                          ? '#F59E0B'
                          : '#2563EB'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontSize: '16px', flexShrink: 0 }}>{insight.icon}</span>
                      <p style={{ fontSize: '10px', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                        {insight.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: 'auto',
              paddingTop: '12px',
              borderTop: '3px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#1f2937', margin: 0, marginBottom: '4px' }}>
                BADAN RISET DAN INOVASI DAERAH PROVINSI JAWA TIMUR
              </p>
              <p style={{ fontSize: '9px', color: '#6b7280', margin: 0, lineHeight: '1.4' }}>
                Jl. Gayung Kebonsari No.56, Gayungan, Kec. Gayungan, Surabaya, Jawa Timur 60235 <br /> Email: brida@jatimprov.go.id | Website: brida.jatimprov.go.id
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
