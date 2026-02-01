import { useState, useEffect } from 'react';
import { X, Save, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase, InovasiDaerah } from '../lib/supabase';

interface EditDataProps {
  darkMode: boolean;
  data: InovasiDaerah;
  onClose: () => void;
  onSubmit: (data: Partial<InovasiDaerah>) => void;
}

// List Urusan Lain yang Beririsan (bisa pilih lebih dari satu)
const urusanLainList = [
  'Administrasi Kependudukan dan Pencatatan Sipil',
  'Energi dan Sumber Daya Mineral',
  'Kearsipan',
  'Kebudayaan',
  'Kehutanan',
  'Kelautan dan Perikanan',
  'Kepemudaan dan Olah Raga',
  'Kesehatan',
  'Ketenteraman, Ketertiban Umum, dan Pelindungan Masyarakat',
  'Komunikasi dan Informatika',
  'Koperasi, Usaha Kecil, dan Menengah',
  'Lingkungan Hidup',
  'Pangan',
  'Pariwisata',
  'Pekerjaan Umum dan Penataan Ruang',
  'Pemberdayaan Masyarakat dan Desa',
  'Pemberdayaan Perempuan dan Pelindungan Anak',
  'Penanaman Modal',
  'Pengendalian Penduduk dan Keluarga Berencana',
  'Perdagangan',
  'Perhubungan',
  'Perindustrian',
  'Perpustakaan',
  'Pertanahan',
  'Pertanian',
  'Perumahan Rakyat dan Kawasan Permukiman',
  'Sosial',
  'Statistik',
  'Tenaga Kerja',
  'Transmigrasi',
  'Fungsi Penunjang lainnya sesuai dengan ketentuan peraturan perundang-undangan',
  'Kepegawaian',
  'Keuangan',
  'Pendidikan dan Pelatihan (Diklat)',
  'Penelitian dan Pengembangan (Litbang)',
  'Perencanaan',
  'Tidak ada',
];

export function EditData({ darkMode, data, onClose, onSubmit }: EditDataProps) {
  // State form dengan data existing
  const [formData, setFormData] = useState<InovasiDaerah>(data);

  // State untuk data unik dari database
  const [uniqueValues, setUniqueValues] = useState({
    inisiator: [] as string[],
    bentuk_inovasi: [] as string[],
    jenis: [] as string[],
    asta_cipta: [] as string[],
    urusan_utama: [] as string[],
    tahapan_inovasi: [] as string[],
  });

  // State untuk urusan lain yang dipilih (parse dari data existing)
  const [selectedUrusanLain, setSelectedUrusanLain] = useState<string[]>(
    data.urusan_lain_yang_beririsan ? data.urusan_lain_yang_beririsan.split(', ').filter(Boolean) : []
  );

  // State untuk dropdown
  const [searchInisiator, setSearchInisiator] = useState('');
  const [searchBentuk, setSearchBentuk] = useState('');
  const [searchJenis, setSearchJenis] = useState('');
  const [searchAsta, setSearchAsta] = useState('');
  const [searchUrusan, setSearchUrusan] = useState('');
  const [searchUrusanLain, setSearchUrusanLain] = useState('');
  const [searchTahapan, setSearchTahapan] = useState('');
  
  const [showInisiatorDropdown, setShowInisiatorDropdown] = useState(false);
  const [showBentukDropdown, setShowBentukDropdown] = useState(false);
  const [showJenisDropdown, setShowJenisDropdown] = useState(false);
  const [showAstaDropdown, setShowAstaDropdown] = useState(false);
  const [showUrusanDropdown, setShowUrusanDropdown] = useState(false);
  const [showUrusanLainDropdown, setShowUrusanLainDropdown] = useState(false);
  const [showTahapanDropdown, setShowTahapanDropdown] = useState(false);

  // State untuk loading dan notifikasi
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch nilai unik dari database
  useEffect(() => {
    const fetchUniqueValues = async () => {
      try {
        setLoadingOptions(true);
        
        const { data: allData, error } = await supabase
          .from('inovasi_daerah')
          .select('inisiator, bentuk_inovasi, jenis, asta_cipta, urusan_utama, tahapan_inovasi');

        if (error) throw error;

        if (allData) {
          // Extract unique values untuk setiap field
          const unique = {
            inisiator: [...new Set(allData.map(item => item.inisiator).filter(Boolean))].sort(),
            bentuk_inovasi: [...new Set(allData.map(item => item.bentuk_inovasi).filter(Boolean))].sort(),
            jenis: [...new Set(allData.map(item => item.jenis).filter(Boolean))].sort(),
            asta_cipta: [...new Set(allData.map(item => item.asta_cipta).filter(Boolean))].sort(),
            urusan_utama: [...new Set(allData.map(item => item.urusan_utama).filter(Boolean))].sort(),
            tahapan_inovasi: [...new Set(allData.map(item => item.tahapan_inovasi).filter(Boolean))].sort(),
          };

          setUniqueValues(unique);
        }
      } catch (err) {
        console.error('Error fetching unique values:', err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchUniqueValues();
  }, []);

  // Filter data dropdown
  const filteredInisiator = uniqueValues.inisiator.filter(val => 
    val.toLowerCase().includes(searchInisiator.toLowerCase())
  );

  const filteredBentuk = uniqueValues.bentuk_inovasi.filter(val => 
    val.toLowerCase().includes(searchBentuk.toLowerCase())
  );

  const filteredJenis = uniqueValues.jenis.filter(val => 
    val.toLowerCase().includes(searchJenis.toLowerCase())
  );

  const filteredAsta = uniqueValues.asta_cipta.filter(val => 
    val.toLowerCase().includes(searchAsta.toLowerCase())
  );

  const filteredUrusan = uniqueValues.urusan_utama.filter(val => 
    val.toLowerCase().includes(searchUrusan.toLowerCase())
  );

  // Filter urusan lain dari list manual
  const filteredUrusanLain = urusanLainList.filter(val => 
    val.toLowerCase().includes(searchUrusanLain.toLowerCase())
  );

  const filteredTahapan = uniqueValues.tahapan_inovasi.filter(val => 
    val.toLowerCase().includes(searchTahapan.toLowerCase())
  );

  // Toggle urusan lain (multi-select)
  const toggleUrusanLain = (urusan: string) => {
    setSelectedUrusanLain(prev => {
      if (prev.includes(urusan)) {
        return prev.filter(item => item !== urusan);
      } else {
        return [...prev, urusan];
      }
    });
  };

  // Submit form ke parent component
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Gabungkan urusan lain jadi string
    const dataToSubmit = {
      ...formData,
      urusan_lain_yang_beririsan: selectedUrusanLain.join(', '),
    };
    
    onSubmit(dataToSubmit);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 border-b flex items-center justify-between ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Edit Data Inovasi
          </h3>
          <button 
            onClick={onClose} 
            disabled={loading}
            className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'} disabled:opacity-50`}
          >
            <X size={24} />
          </button>
        </div>

        {success && (
          <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-green-800">Data berhasil diupdate!</span>
          </div>
        )}

        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-semibold">Gagal menyimpan data</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Grid 2 kolom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Judul Inovasi */}
            <div className="md:col-span-2">
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Judul Inovasi *
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={formData.judul_inovasi}
                onChange={(e) => setFormData({ ...formData, judul_inovasi: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
                placeholder="Masukkan judul inovasi"
              />
            </div>

            {/* Pemda */}
            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Pemda *
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={formData.pemda}
                onChange={(e) => setFormData({ ...formData, pemda: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
            </div>

            {/* Admin OPD */}
            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Admin OPD *
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={formData.admin_opd}
                onChange={(e) => setFormData({ ...formData, admin_opd: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
                placeholder="Masukkan nama Admin OPD"
              />
            </div>

            {/* Inisiator - Searchable Dropdown */}
            <div className="relative">
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Inisiator *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={loading || loadingOptions}
                  value={searchInisiator || formData.inisiator}
                  onChange={(e) => {
                    setSearchInisiator(e.target.value);
                    setShowInisiatorDropdown(true);
                  }}
                  onFocus={() => {
                    if (!loading && !loadingOptions) {
                      setSearchInisiator('');
                      setShowInisiatorDropdown(true);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowInisiatorDropdown(false);
                      setSearchInisiator('');
                    }, 200);
                  }}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Ketik atau pilih Inisiator"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {showInisiatorDropdown && filteredInisiator.length > 0 && !loading && !loadingOptions && (
                <div 
                  onMouseDown={(e) => e.preventDefault()}
                  className={`absolute z-20 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  {filteredInisiator.map((val, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setFormData({ ...formData, inisiator: val });
                        setSearchInisiator('');
                        setShowInisiatorDropdown(false);
                      }}
                      className={`px-3 py-2 cursor-pointer transition-colors ${
                        darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nama Inisiator */}
            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nama Inisiator *
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={formData.nama_inisiator}
                onChange={(e) => setFormData({ ...formData, nama_inisiator: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
                placeholder="Nama lengkap inisiator"
              />
            </div>

            {/* Bentuk Inovasi - Searchable Dropdown */}
            <div className="relative">
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Bentuk Inovasi *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={loading || loadingOptions}
                  value={searchBentuk || formData.bentuk_inovasi}
                  onChange={(e) => {
                    setSearchBentuk(e.target.value);
                    setShowBentukDropdown(true);
                  }}
                  onFocus={() => {
                    if (!loading && !loadingOptions) {
                      setSearchBentuk('');
                      setShowBentukDropdown(true);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowBentukDropdown(false);
                      setSearchBentuk('');
                    }, 200);
                  }}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Ketik atau pilih Bentuk Inovasi"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {showBentukDropdown && filteredBentuk.length > 0 && !loading && !loadingOptions && (
                <div onMouseDown={(e) => e.preventDefault()}
                  className={`absolute z-20 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}>
                  {filteredBentuk.map((val, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setFormData({ ...formData, bentuk_inovasi: val });
                        setSearchBentuk('');
                        setShowBentukDropdown(false);
                      }}
                      className={`px-3 py-2 cursor-pointer transition-colors ${
                        darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Jenis - Searchable Dropdown */}
            <div className="relative">
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Jenis *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={loading || loadingOptions}
                  value={searchJenis || formData.jenis}
                  onChange={(e) => {
                    setSearchJenis(e.target.value);
                    setShowJenisDropdown(true);
                  }}
                  onFocus={() => {
                    if (!loading && !loadingOptions) {
                      setSearchJenis('');
                      setShowJenisDropdown(true);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowJenisDropdown(false);
                      setSearchJenis('');
                    }, 200);
                  }}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Ketik atau pilih Jenis"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {showJenisDropdown && filteredJenis.length > 0 && !loading && !loadingOptions && (
                <div onMouseDown={(e) => e.preventDefault()}
                  className={`absolute z-20 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}>
                  {filteredJenis.map((val, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setFormData({ ...formData, jenis: val });
                        setSearchJenis('');
                        setShowJenisDropdown(false);
                      }}
                      className={`px-3 py-2 cursor-pointer transition-colors ${
                        darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Asta Cipta - Searchable Dropdown */}
            <div className="relative">
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Asta Cipta *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={formData.asta_cipta || searchAsta}
                  onChange={(e) => {
                    setSearchAsta(e.target.value);
                    setFormData({ ...formData, asta_cipta: e.target.value });
                    setShowAstaDropdown(true);
                  }}
                  onFocus={() => !loading && setShowAstaDropdown(true)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Cari atau pilih Asta Cipta"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {showAstaDropdown && filteredAsta.length > 0 && !loading && (
                <div className={`absolute z-20 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}>
                  {filteredAsta.map((asta, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setFormData({ ...formData, asta_cipta: asta });
                        setSearchAsta('');
                        setShowAstaDropdown(false);
                      }}
                      className={`px-3 py-2 cursor-pointer transition-colors ${
                        darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      {asta}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Urusan Utama - Searchable Dropdown */}
            <div className="relative">
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Urusan Utama *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={formData.urusan_utama || searchUrusan}
                  onChange={(e) => {
                    setSearchUrusan(e.target.value);
                    setFormData({ ...formData, urusan_utama: e.target.value });
                    setShowUrusanDropdown(true);
                  }}
                  onFocus={() => !loading && setShowUrusanDropdown(true)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Cari atau pilih Urusan Utama"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {showUrusanDropdown && filteredUrusan.length > 0 && !loading && (
                <div className={`absolute z-20 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}>
                  {filteredUrusan.map((urusan, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setFormData({ ...formData, urusan_utama: urusan });
                        setSearchUrusan('');
                        setShowUrusanDropdown(false);
                      }}
                      className={`px-3 py-2 cursor-pointer transition-colors ${
                        darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      {urusan}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Urusan Lain yang Beririsan - Multi Select */}
            <div className="relative md:col-span-2">
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Urusan Lain Yang Beririsan (bisa pilih lebih dari 1)
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={loading}
                  value={searchUrusanLain}
                  onChange={(e) => {
                    setSearchUrusanLain(e.target.value);
                    setShowUrusanLainDropdown(true);
                  }}
                  onFocus={() => !loading && setShowUrusanLainDropdown(true)}
                  onBlur={() => {
                    setTimeout(() => setShowUrusanLainDropdown(false), 200);
                  }}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Cari urusan lain..."
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              
              {/* Selected items */}
              {selectedUrusanLain.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedUrusanLain.map((urusan, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {urusan}
                      <button
                        type="button"
                        onClick={() => toggleUrusanLain(urusan)}
                        className="hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Dropdown */}
              {showUrusanLainDropdown && filteredUrusanLain.length > 0 && !loading && (
                <div 
                  onMouseDown={(e) => e.preventDefault()}
                  className={`absolute z-20 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  {filteredUrusanLain.map((val, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        toggleUrusanLain(val);
                        setSearchUrusanLain('');
                      }}
                      className={`px-3 py-2 cursor-pointer transition-colors flex items-center justify-between ${
                        darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-800'
                      } ${selectedUrusanLain.includes(val) ? (darkMode ? 'bg-blue-900/30' : 'bg-blue-50') : ''}`}
                    >
                      <span>{val}</span>
                      {selectedUrusanLain.includes(val) && (
                        <CheckCircle size={16} className="text-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kematangan */}
            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Kematangan (0-120) *
              </label>
              <input
                type="number"
                required
                disabled={loading}
                min="0"
                max="120"
                value={formData.kematangan}
                onChange={(e) => setFormData({ ...formData, kematangan: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
            </div>

            {/* Tahapan Inovasi - Searchable Dropdown */}
            <div className="relative">
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tahapan Inovasi *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={loading || loadingOptions}
                  value={searchTahapan || formData.tahapan_inovasi}
                  onChange={(e) => {
                    setSearchTahapan(e.target.value);
                    setShowTahapanDropdown(true);
                  }}
                  onFocus={() => {
                    if (!loading && !loadingOptions) {
                      setSearchTahapan('');
                      setShowTahapanDropdown(true);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowTahapanDropdown(false);
                      setSearchTahapan('');
                    }, 200);
                  }}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Ketik atau pilih Tahapan Inovasi"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {showTahapanDropdown && filteredTahapan.length > 0 && !loading && !loadingOptions && (
                <div onMouseDown={(e) => e.preventDefault()}
                  className={`absolute z-20 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}>
                  {filteredTahapan.map((val, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setFormData({ ...formData, tahapan_inovasi: val });
                        setSearchTahapan('');
                        setShowTahapanDropdown(false);
                      }}
                      className={`px-3 py-2 cursor-pointer transition-colors ${
                        darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tanggal Input */}
            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tanggal Input *
              </label>
              <input
                type="date"
                required
                disabled={loading}
                value={formData.tanggal_input}
                onChange={(e) => setFormData({ ...formData, tanggal_input: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
            </div>

            {/* Tanggal Penerapan */}
            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tanggal Penerapan
              </label>
              <input
                type="date"
                disabled={loading}
                value={formData.tanggal_penerapan}
                onChange={(e) => setFormData({ ...formData, tanggal_penerapan: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
            </div>

            {/* Tanggal Pengembangan */}
            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tanggal Pengembangan
              </label>
              <input
                type="date"
                disabled={loading}
                value={formData.tanggal_pengembangan}
                onChange={(e) => setFormData({ ...formData, tanggal_pengembangan: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
            </div>

            {/* Video */}
            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Video *
              </label>
              <select
                required
                disabled={loading}
                value={formData.video}
                onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                <option>Ada</option>
                <option>Tidak</option>
              </select>
            </div>

            {/* Link Video */}
            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Link Video {formData.video === 'Ada' && '*'}
              </label>
              <input
                type="url"
                required={formData.video === 'Ada'}
                disabled={formData.video === 'Tidak' || loading}
                value={formData.link_video}
                onChange={(e) => setFormData({ ...formData, link_video: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800 disabled:bg-gray-100'
                }`}
                placeholder="https://youtube.com/..."
              />
            </div>

            {/* Latitude */}
            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Latitude *
              </label>
              <input
                type="number"
                required
                disabled={loading}
                step="0.000001"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
                placeholder="-7.2575"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Longitude *
              </label>
              <input
                type="number"
                required
                disabled={loading}
                step="0.000001"
                value={formData.lon}
                onChange={(e) => setFormData({ ...formData, lon: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
                placeholder="112.7521"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex justify-end gap-3 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {loading ? 'Mengupdate...' : 'Update Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}